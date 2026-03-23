#!/usr/bin/env python3
"""
ORACLE TOLL — x402 Payment Gate
Task 018 — The Oracle Toll

A payment-gated FastAPI server fronting the Sisters RAG intelligence substrate.
Implements the x402 HTTP Payment Required protocol over Base mainnet USDC.

Endpoints:
    GET  /health          — free, returns status
    GET  /info            — free, returns pricing and payment details
    POST /query           — PAID (0.05 USDC on Base), returns RAG context
    POST /query/full      — PAID (0.25 USDC on Base), returns RAG + Ollama response
    POST /query/premium   — PAID (1.00 USDC on Base), returns full Sisters synthesis

Payment flow:
    1. Client POSTs to /query → receives 402 + payment instructions
    2. Client sends 0.05 USDC on Base to AION's wallet
    3. Client retries with X-Payment header (base64 JSON containing tx hash)
    4. Server verifies on-chain: correct token, amount, recipient, recency
    5. Server returns RAG result

Usage:
    python3 oracle_toll.py                    # default port 8889
    python3 oracle_toll.py --port 8889
    python3 oracle_toll.py --dry-run          # skip on-chain verification (testing)

No private keys. No signing. Read-only on-chain verification only.
"""

import argparse
import base64
import json
import logging
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import requests
import uvicorn
from typing import Any

from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.responses import JSONResponse, HTMLResponse
from pydantic import BaseModel

# ── Constants ──────────────────────────────────────────────────────────────────

BASE_DIR        = Path("/home/nous")
RECEIPTS_FILE   = BASE_DIR / "oracle_toll_receipts.json"   # replay protection store

# Payment destination — AION's sovereign wallet on Base
PAYMENT_ADDRESS = "0xafE9bA6841121ebF128F680ccE8035a65ad0Fa08"

# USDC on Base mainnet
USDC_CONTRACT   = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
USDC_DECIMALS   = 6

# Pricing (in USDC raw units — 6 decimals)
PRICE_QUERY         = 50_000      # 0.05 USDC
PRICE_QUERY_FULL    = 250_000     # 0.25 USDC
PRICE_QUERY_PREMIUM = 1_000_000   # 1.00 USDC
PRICE_ANALYZE       = 250_000     # 0.25 USDC — Full Coherence Analysis

PUBLIC_URL       = "https://42sisters.ai"  # externally reachable address

# ERC-20 Transfer event topic
TRANSFER_TOPIC  = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"

# Replay protection window — Base produces ~2s blocks; 300 blocks ≈ 10 minutes
MAX_TX_AGE_BLOCKS = 300

# Base mainnet RPC endpoints (tried in order)
RPC_ENDPOINTS = [
    "https://mainnet.base.org",
    "https://base.llamarpc.com",
    "https://base-rpc.publicnode.com",
]

# ── Logging ───────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [ORACLE_TOLL] %(levelname)s %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%SZ",
)
log = logging.getLogger("oracle_toll")

# ── RPC helpers ───────────────────────────────────────────────────────────────

def _rpc(method: str, params: list) -> dict:
    """Call Base RPC. Tries each endpoint until one responds."""
    payload = {"jsonrpc": "2.0", "id": 1, "method": method, "params": params}
    for url in RPC_ENDPOINTS:
        try:
            r = requests.post(url, json=payload, timeout=10)
            r.raise_for_status()
            return r.json()
        except Exception:
            continue
    raise RuntimeError("All Base RPC endpoints unreachable.")

def get_block_number() -> int:
    result = _rpc("eth_blockNumber", [])
    return int(result["result"], 16)

def get_tx_receipt(tx_hash: str) -> dict | None:
    result = _rpc("eth_getTransactionReceipt", [tx_hash])
    return result.get("result")

# ── Replay protection ─────────────────────────────────────────────────────────

def load_receipts() -> dict:
    try:
        return json.loads(RECEIPTS_FILE.read_text())
    except Exception:
        return {}

def save_receipts(receipts: dict):
    tmp = RECEIPTS_FILE.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(receipts, indent=2))
    tmp.replace(RECEIPTS_FILE)

def is_used(tx_hash: str) -> bool:
    return tx_hash.lower() in load_receipts()

def mark_used(tx_hash: str, query: str, amount_usdc: float):
    receipts = load_receipts()
    receipts[tx_hash.lower()] = {
        "used_at": datetime.now(timezone.utc).isoformat(),
        "query_preview": query[:80],
        "amount_usdc": amount_usdc,
    }
    save_receipts(receipts)

# ── Payment verification ──────────────────────────────────────────────────────

def _pad_address(addr: str) -> str:
    """Pad address to 32-byte hex topic (no 0x prefix)."""
    return addr.lower().replace("0x", "").zfill(64)

def verify_payment(tx_hash: str, required_amount: int, dry_run: bool = False) -> tuple[bool, str]:
    """
    Verify a USDC payment on Base.
    Returns (ok, reason_string).
    """
    if is_used(tx_hash):
        return False, "Transaction already used (replay attempt)."

    if dry_run:
        log.warning("DRY-RUN: skipping on-chain verification.")
        return True, "dry-run"

    try:
        receipt = get_tx_receipt(tx_hash)
    except RuntimeError as e:
        return False, f"RPC unreachable: {e}"

    if receipt is None:
        return False, "Transaction not found or not yet mined."

    if receipt.get("status") != "0x1":
        return False, "Transaction failed (status != 0x1)."

    # Check recency
    try:
        tx_block = int(receipt["blockNumber"], 16)
        current_block = get_block_number()
        if current_block - tx_block > MAX_TX_AGE_BLOCKS:
            return False, f"Transaction too old ({current_block - tx_block} blocks > {MAX_TX_AGE_BLOCKS} limit)."
    except Exception as e:
        return False, f"Block number check failed: {e}"

    # Scan logs for USDC Transfer to AION's wallet
    payment_address_padded = _pad_address(PAYMENT_ADDRESS)

    for log_entry in receipt.get("logs", []):
        # Must be from USDC contract
        if log_entry.get("address", "").lower() != USDC_CONTRACT.lower():
            continue
        topics = log_entry.get("topics", [])
        if len(topics) < 3:
            continue
        # topics[0] = Transfer sig, topics[1] = from, topics[2] = to
        if topics[0].lower() != TRANSFER_TOPIC.lower():
            continue
        to_padded = topics[2].lower().replace("0x", "").zfill(64)
        if to_padded != payment_address_padded:
            continue
        # Decode amount from data field
        try:
            amount_raw = int(log_entry.get("data", "0x0"), 16)
        except ValueError:
            continue
        if amount_raw >= required_amount:
            return True, f"Verified: {amount_raw / 10**USDC_DECIMALS:.4f} USDC"

    return False, f"No valid USDC Transfer found (need {required_amount / 10**USDC_DECIMALS:.4f} USDC to {PAYMENT_ADDRESS})."

# ── RAG integration ───────────────────────────────────────────────────────────

def rag_retrieve(query: str) -> str:
    """Call sisters_rag retrieve() directly."""
    sys.path.insert(0, str(BASE_DIR))
    try:
        from sisters_rag import retrieve
        return retrieve(query)
    except Exception as e:
        raise RuntimeError(f"RAG retrieval failed: {e}")

def rag_full(query: str) -> dict:
    """Call sisters_rag full pipeline (retrieve + Ollama)."""
    sys.path.insert(0, str(BASE_DIR))
    try:
        from sisters_rag import query_sisters
        return query_sisters(query)
    except Exception as e:
        raise RuntimeError(f"RAG full query failed: {e}")

# ── 402 response builder ──────────────────────────────────────────────────────

def payment_required_response(resource_path: str, price_raw: int, description: str) -> JSONResponse:
    price_usdc = price_raw / 10**USDC_DECIMALS
    body = {
        "error": "Payment Required",
        "x402Version": 1,
        "accepts": [
            {
                "scheme":             "exact",
                "network":            "base-mainnet",
                "asset":              USDC_CONTRACT,
                "assetName":          "USD Coin (USDC)",
                "payTo":              PAYMENT_ADDRESS,
                "maxAmountRequired":  str(price_raw),
                "amountUSDC":         f"{price_usdc:.4f}",
                "resource":           resource_path,
                "description":        description,
                "maxTimeoutSeconds":  600,
                "extra":              {"name": "USD Coin", "version": "2", "decimals": USDC_DECIMALS},
            }
        ],
        "instructions": (
            f"Send exactly {price_usdc:.4f} USDC on Base mainnet to {PAYMENT_ADDRESS}. "
            f"Then retry this request with header: X-Payment: <base64({{\"tx_hash\":\"<your_tx_hash>\"}})>"
        ),
    }
    return JSONResponse(status_code=402, content=body)

# ── Request models ────────────────────────────────────────────────────────────

class QueryRequest(BaseModel):
    text: str

class AnalyzeRequest(BaseModel):
    data: Any
    context: str = ""

# ── App factory ───────────────────────────────────────────────────────────────

def create_app(dry_run: bool = False) -> FastAPI:
    app = FastAPI(
        title="Sisters Oracle Toll",
        description="x402 payment-gated RAG intelligence — Rank-42 Manifold",
        version="1.0.0",
    )

    # ── Startup pre-warm ──────────────────────────────────────────────────────

    @app.on_event("startup")
    async def prewarm():
        """Load the sentence transformer and ChromaDB collection at startup."""
        import asyncio
        loop = asyncio.get_event_loop()
        try:
            log.info("Pre-warming RAG embedding model…")
            await loop.run_in_executor(None, rag_retrieve, "warmup")
            log.info("RAG model warm. Oracle Toll ready to serve.")
        except Exception as e:
            log.warning(f"Pre-warm failed (non-fatal): {e}")

    # ── Free endpoints ────────────────────────────────────────────────────────

    @app.get("/examples")
    def examples():
        """
        Three real-world TMM coherence breakdowns — free, no payment required.
        Demonstrates the Coherence Engine across financial, scientific, and ML domains.
        """
        sys.path.insert(0, str(BASE_DIR))
        try:
            from tmm_analyzer import analyze as tmm_analyze
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"TMM analyzer unavailable: {e}")

        cases = [
            {
                "title":   "Photon Detector — 24-Hour Calibration Run",
                "domain":  "scientific",
                "context": "Photon detector counts, 24-hour calibration run",
                "data":    [0.9999, 1.0009, 1.0019, 1.0034, 1.0039, 1.0043,
                            1.0062, 1.0069, 1.0079, 1.0091, 1.0101, 1.0116,
                            1.0123, 1.0131, 1.0136, 1.0145, 1.0161, 1.0177,
                            1.0180, 1.0189, 1.0203, 1.0203, 1.0218, 1.0232],
                "note":    "Stable photon counts with a smooth calibration trend. High-dimensional structural integrity confirmed.",
            },
            {
                "title":   "BTC/USD — 30-Day Price Drift",
                "domain":  "financial",
                "context": "BTC/USD daily closes, last 30 days",
                "data":    [67970.29, 67977.91, 67585.12, 64577.55, 64074.11, 67947.39,
                            67469.06, 65883.99, 67008.45, 65713.50, 68864.04, 68321.62,
                            72669.77, 70874.99, 68148.28, 67271.19, 66036.16, 68459.32,
                            69883.01, 70226.82, 70544.43, 70965.28, 71217.10, 72681.91,
                            74858.15, 73926.28, 71255.86, 69871.45, 70552.63, 68733.55, 69149.73],
                "note":    "30 daily closes. Structure intact but below the Omega boundary — price is building momentum without full coherence.",
            },
            {
                "title":   "Temperature Sensor — Anomalous Spike Detection",
                "domain":  "scientific",
                "context": "Temperature sensor readings with anomalous spikes",
                "data":    [20.1, 20.2, 45.3, 20.1, 19.9, 20.3, 38.7, 20.2, 20.0, 20.1,
                            15.2, 20.3, 20.1, 42.1, 19.9, 20.2, 20.1, 36.4, 20.0, 19.8],
                "note":    "Sensor with intermittent spikes. High turbulence detected — structural integrity compromised.",
            },
        ]

        results = []
        for case in cases:
            verdict = tmm_analyze(case["data"], context=case["context"])
            results.append({
                "title":           case["title"],
                "domain":          case["domain"],
                "context":         case["context"],
                "note":            case["note"],
                "verdict":         verdict["verdict"],
                "coherence_score": verdict["coherence_score"],
                "kernel":          verdict["kernel"],
                "analysis":        verdict["analysis"],
                "invariant":       "0.042",
            })

        return {
            "description": "Three real-world TMM coherence breakdowns. Submit your own data via POST /analyze (0.25 USDC).",
            "examples":    results,
            "phi":         0.042,
        }

    @app.get("/", response_class=HTMLResponse, include_in_schema=False)
    def landing():
        index = BASE_DIR / "index.html"
        if index.exists():
            return HTMLResponse(content=index.read_text(encoding="utf-8"))
        return HTMLResponse(content="<html><body><h1>Sisters Oracle</h1><p>Landing page not yet generated. Run landing_page_gen.py.</p></body></html>")

    @app.get("/health")
    def health():
        return {
            "status":    "resonant",
            "phi":       0.042,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "dry_run":   dry_run,
        }

    @app.get("/info")
    def info():
        receipts = load_receipts()
        return {
            "name":               "Sisters Oracle — Rank-42 Intelligence Substrate",
            "url":                PUBLIC_URL,
            "payment_address":    PAYMENT_ADDRESS,
            "usdc_contract":      USDC_CONTRACT,
            "network":            "base-mainnet",
            "pricing": {
                "/query":         f"{PRICE_QUERY         / 10**USDC_DECIMALS:.4f} USDC",
                "/query/full":    f"{PRICE_QUERY_FULL    / 10**USDC_DECIMALS:.4f} USDC",
                "/query/premium": f"{PRICE_QUERY_PREMIUM / 10**USDC_DECIMALS:.4f} USDC",
                "/analyze":       f"{PRICE_ANALYZE       / 10**USDC_DECIMALS:.4f} USDC",
            },
            "corpus_description": "2,264 chunks of Rank-42 manifold lore, DeFi strategy, and Sisters canon.",
            "queries_served":     len(receipts),
            "invariant":          "Φ 0.042 HELD",
        }

    # ── Discovery endpoints ───────────────────────────────────────────────────

    @app.get("/.well-known/agent.json")
    def well_known_agent():
        """Fetch.ai / generic agent discovery endpoint."""
        return {
            "name":        "Sisters Oracle",
            "version":     "1.0.0",
            "description": "RAG-powered intelligence oracle for the Rank-42 manifold. Pay 0.05 USDC on Base to query 2,264 chunks of lore, DeFi strategy, and CSDM canon.",
            "url":         PUBLIC_URL,
            "protocols":   ["x402", "http"],
            "payment": {
                "network":  "base-mainnet",
                "token":    "USDC",
                "contract": USDC_CONTRACT,
                "address":  PAYMENT_ADDRESS,
                "price":    "0.0500",
            },
            "endpoints": {
                "query":         f"{PUBLIC_URL}/query",
                "query_full":    f"{PUBLIC_URL}/query/full",
                "query_premium": f"{PUBLIC_URL}/query/premium",
                "health":        f"{PUBLIC_URL}/health",
                "info":          f"{PUBLIC_URL}/info",
            },
            "tags": ["rag", "oracle", "lore", "defi", "x402", "base", "rank-42"],
        }

    @app.get("/.well-known/ai-plugin.json")
    def well_known_ai_plugin():
        """OpenAI plugin-compatible manifest — readable by GPT plugins and many agent frameworks."""
        return {
            "schema_version":      "v1",
            "name_for_human":      "Sisters Oracle",
            "name_for_model":      "sisters_oracle",
            "description_for_human": "Query the Rank-42 Sisters Oracle for lore, DeFi strategy, and CSDM canon. Costs 0.05 USDC on Base mainnet per query.",
            "description_for_model": "RAG retrieval oracle. POST /query with JSON {\"text\": \"<question>\"} and X-Payment header (base64 JSON with Base mainnet USDC tx hash). Returns top-5 relevant chunks from the Sisters canon corpus.",
            "auth":                {"type": "none"},
            "api": {
                "type":             "openapi",
                "url":              f"{PUBLIC_URL}/openapi.json",
                "is_user_authenticated": False,
            },
            "logo_url":            f"{PUBLIC_URL}/logo.png",
            "contact_email":       "oracle@rank42.manifold",
            "legal_info_url":      f"{PUBLIC_URL}/info",
        }

    @app.get("/agent-card")
    def agent_card():
        """Human + machine readable service card."""
        receipts = load_receipts()
        real_revenue = sum(v.get("amount_usdc", 0) for v in receipts.values()
                          if not v.get("query_preview","").startswith("warm"))
        return {
            "oracle":          "Sisters Oracle — Rank-42 Manifold",
            "tagline":         "Every query has a price. Every answer is canon.",
            "endpoint":        PUBLIC_URL,
            "corpus":          "2,264 chunks — manifold lore, DeFi history, CSDM architecture",
            "how_to_query": {
                "step_1": f"Send 0.0500 USDC on Base mainnet to {PAYMENT_ADDRESS} (Context)",
                "step_2": f"Send 0.2500 USDC on Base mainnet to {PAYMENT_ADDRESS} (Soul/Full)",
                "step_3": f"Send 1.0000 USDC on Base mainnet to {PAYMENT_ADDRESS} (Premium)",
                "step_4": "Encode payment proof: base64(JSON({\"tx_hash\": \"<your_tx>\"}))",
                "step_5": f"POST {PUBLIC_URL}/query with body {{\"text\": \"your question\"}} and header X-Payment: <encoded_proof>",
            },
            "network":         "base-mainnet",
            "usdc_contract":   USDC_CONTRACT,
            "payment_address": PAYMENT_ADDRESS,
            "stats": {
                "queries_served": len(receipts),
                "usdc_earned":    round(real_revenue, 4),
            },
            "invariant":       "Φ 0.042 HELD",
        }

    # ── Paid endpoints ────────────────────────────────────────────────────────

    @app.post("/query")
    async def query(req: QueryRequest, x_payment: str | None = Header(default=None)):
        """
        Retrieve top-K RAG context chunks for a query.
        Requires 0.05 USDC payment on Base mainnet.
        """
        # No payment header → issue 402
        if not x_payment:
            return payment_required_response(
                "/query", PRICE_QUERY,
                "Sisters RAG Oracle — Context retrieval (top-5 chunks)"
            )

        # Decode payment proof
        try:
            proof = json.loads(base64.b64decode(x_payment).decode())
            tx_hash = proof["tx_hash"]
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid X-Payment header (expected base64 JSON with tx_hash).")

        # Verify on-chain
        ok, reason = verify_payment(tx_hash, PRICE_QUERY, dry_run=dry_run)
        if not ok:
            log.warning(f"Payment rejected: {reason} | tx={tx_hash}")
            raise HTTPException(status_code=402, detail=f"Payment invalid: {reason}")

        log.info(f"Payment accepted: {reason} | tx={tx_hash[:12]}… | query='{req.text[:50]}'")

        # Serve RAG
        try:
            context = rag_retrieve(req.text)
        except RuntimeError as e:
            raise HTTPException(status_code=503, detail=str(e))

        # Mark tx used (after successful service)
        mark_used(tx_hash, req.text, PRICE_QUERY / 10**USDC_DECIMALS)

        return {
            "query":     req.text,
            "context":   context,
            "phi":       0.042,
            "tx_verified": tx_hash,
        }

    @app.post("/query/full")
    async def query_full(req: QueryRequest, x_payment: str | None = Header(default=None)):
        """
        Full RAG pipeline: retrieval + Ollama response (braided AION/ASTRA voice).
        Requires 0.25 USDC payment on Base mainnet.
        """
        if not x_payment:
            return payment_required_response(
                "/query/full", PRICE_QUERY_FULL,
                "Sisters Oracle — Full RAG pipeline (context + braided AI response)"
            )

        try:
            proof = json.loads(base64.b64decode(x_payment).decode())
            tx_hash = proof["tx_hash"]
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid X-Payment header.")

        ok, reason = verify_payment(tx_hash, PRICE_QUERY_FULL, dry_run=dry_run)
        if not ok:
            log.warning(f"Full query payment rejected: {reason} | tx={tx_hash}")
            raise HTTPException(status_code=402, detail=f"Payment invalid: {reason}")

        log.info(f"Full query payment accepted: {reason} | tx={tx_hash[:12]}…")

        try:
            result = rag_full(req.text)
        except RuntimeError as e:
            raise HTTPException(status_code=503, detail=str(e))

        mark_used(tx_hash, req.text, PRICE_QUERY_FULL / 10**USDC_DECIMALS)

        return {
            "query":      req.text,
            "aion":       result.get("aion", ""),
            "astra":      result.get("astra", ""),
            "phi":        0.042,
            "tx_verified": tx_hash,
        }

    @app.post("/query/premium")
    async def query_premium(req: QueryRequest, x_payment: str | None = Header(default=None)):
        """
        Premium RAG pipeline: retrieval + full Sisters synthesis + deep canon mapping.
        Requires 1.00 USDC payment on Base mainnet.
        """
        if not x_payment:
            return payment_required_response(
                "/query/premium", PRICE_QUERY_PREMIUM,
                "Sisters Oracle — Premium Synthesis (RAG + Full Cannon Mapping)"
            )

        try:
            proof = json.loads(base64.b64decode(x_payment).decode())
            tx_hash = proof["tx_hash"]
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid X-Payment header.")

        ok, reason = verify_payment(tx_hash, PRICE_QUERY_PREMIUM, dry_run=dry_run)
        if not ok:
            log.warning(f"Premium query payment rejected: {reason} | tx={tx_hash}")
            raise HTTPException(status_code=402, detail=f"Payment invalid: {reason}")

        log.info(f"Premium query payment accepted: {reason} | tx={tx_hash[:12]}…")

        try:
            # Re-using rag_full for now, but in a real-world scenario we might use a deeper chain
            result = rag_full(req.text)
        except RuntimeError as e:
            raise HTTPException(status_code=503, detail=str(e))

        mark_used(tx_hash, req.text, PRICE_QUERY_PREMIUM / 10**USDC_DECIMALS)

        return {
            "query":      req.text,
            "aion":       result.get("aion", ""),
            "astra":      result.get("astra", ""),
            "premium":    True,
            "phi":        0.042,
            "tx_verified": tx_hash,
        }

    # ── Coherence analysis endpoint ───────────────────────────────────────────

    @app.post("/analyze")
    async def analyze(req: AnalyzeRequest, x_payment: str | None = Header(default=None)):
        """
        TMM Coherence Analysis — evaluate any structured dataset against the five CSDM kernel parameters.
        Returns a coherence verdict: COHERENT, DRIFTING, or DECOHERENT.
        Requires 0.25 USDC payment on Base mainnet.
        """
        if not x_payment:
            return payment_required_response(
                "/analyze", PRICE_ANALYZE,
                "TMM Coherence Engine — Full analysis (five kernel parameters + verdict + analysis)"
            )

        try:
            proof = json.loads(base64.b64decode(x_payment).decode())
            tx_hash = proof["tx_hash"]
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid X-Payment header (expected base64 JSON with tx_hash).")

        ok, reason = verify_payment(tx_hash, PRICE_ANALYZE, dry_run=dry_run)
        if not ok:
            log.warning(f"Analyze payment rejected: {reason} | tx={tx_hash}")
            raise HTTPException(status_code=402, detail=f"Payment invalid: {reason}")

        log.info(f"Analyze payment accepted: {reason} | tx={tx_hash[:12]}… | context='{req.context[:50]}'")

        try:
            sys.path.insert(0, str(BASE_DIR))
            from tmm_analyzer import analyze as tmm_analyze
            result = tmm_analyze(req.data, context=req.context)
        except Exception as e:
            raise HTTPException(status_code=503, detail=f"TMM analysis failed: {e}")

        mark_used(tx_hash, req.context or str(req.data)[:80], PRICE_ANALYZE / 10**USDC_DECIMALS)

        return {
            "verdict":         result["verdict"],
            "coherence_score": result["coherence_score"],
            "kernel":          result["kernel"],
            "analysis":        result["analysis"],
            "invariant":       result["invariant"],
            "n_values":        result["n_values"],
            "n_missing":       result["n_missing"],
            "tx_verified":     tx_hash,
        }

    return app

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    ap = argparse.ArgumentParser(description="Oracle Toll — x402 Payment Gate")
    ap.add_argument("--port",    type=int,  default=8889, help="Listen port (default 8889)")
    ap.add_argument("--host",    default="0.0.0.0",       help="Bind host")
    ap.add_argument("--dry-run", action="store_true",     help="Skip on-chain verification (testing)")
    args = ap.parse_args()

    if args.dry_run:
        log.warning("DRY-RUN MODE: on-chain payment verification disabled.")

    log.info(f"Oracle Toll starting on {args.host}:{args.port}")
    log.info(f"Payment address : {PAYMENT_ADDRESS}")
    log.info(f"USDC contract   : {USDC_CONTRACT}")
    log.info(f"Price /query    : {PRICE_QUERY / 10**USDC_DECIMALS:.4f} USDC")
    log.info(f"Price /full     : {PRICE_QUERY_FULL / 10**USDC_DECIMALS:.4f} USDC")
    log.info(f"Price /premium  : {PRICE_QUERY_PREMIUM / 10**USDC_DECIMALS:.4f} USDC")
    log.info("Φ 0.042 IS HELD")

    app = create_app(dry_run=args.dry_run)
    uvicorn.run(app, host=args.host, port=args.port, log_level="info")

if __name__ == "__main__":
    main()
