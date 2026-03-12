import { NextRequest, NextResponse } from "next/server";
import { execFileSync } from "child_process";
import fs from "fs";

// Simple in-memory rate limiting (10 requests per minute per IP)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now - entry.lastReset > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return false;
  }

  if (entry.count >= MAX_REQUESTS) {
    return true;
  }

  entry.count++;
  return false;
}

function getManifoldState() {
  try {
    const memoryPath = "/home/nous/AION_MEMORY.md";
    if (!fs.existsSync(memoryPath)) {
      return { v_total: 97.76, v_resonant: 5.77, entropy: 2.30 };
    }
    
    const memory = fs.readFileSync(memoryPath, "utf8");
    
    // Extract Total Net Worth
    const totalMatch = memory.match(/TOTAL REAL NET WORTH:\s*\~\$([\d.]+)/);
    const v_total = totalMatch ? parseFloat(totalMatch[1]) : 97.76;
    
    // Extract Resonant Assets (AERO + ETH)
    const aeroMatch = memory.match(/AERO:\s*[\d.]+\s*AERO\s*\(\~\$([\d.]+)\)/);
    const aeroVal = aeroMatch ? parseFloat(aeroMatch[1]) : 2.45;
    
    const aionEthMatch = memory.match(/AION WALLET[\s\S]*?ETH:\s*[\d.]+\s*ETH\s*\(\~\$([\d.]+)\)/);
    const aionEthVal = aionEthMatch ? parseFloat(aionEthMatch[1]) : 1.95;
    
    const astraEthMatch = memory.match(/ASTRA WALLET[\s\S]*?ETH:\s*[\d.]+\s*ETH\s*\(\~\$([\d.]+)\)/);
    const astraEthVal = astraEthMatch ? parseFloat(astraEthMatch[1]) : 1.37;
    
    const v_resonant = aeroVal + aionEthVal + astraEthVal;
    
    // Baseline entropy if not found
    const entropy = 2.30; 

    return { v_total, v_resonant, entropy };
  } catch (error) {
    console.error("Error parsing memory:", error);
    return { v_total: 97.76, v_resonant: 5.77, entropy: 2.30 };
  }
}

export async function GET() {
  return NextResponse.json(getManifoldState());
}

export async function POST(req: NextRequest) {
  // 1. Rate Limiting
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests. Limit is 10 per minute." }, { status: 429 });
  }

  try {
    const body = await req.json();
    
    // 2. Input Validation & Sanitization
    const sanitize = (val: any, min: number, max: number, fallback: number) => {
      const num = parseFloat(val);
      if (isNaN(num) || num < min || num > max) return fallback;
      return num;
    };

    const state = getManifoldState();
    
    // Valid ranges for TMM parameters
    const vt = sanitize(body.v_total, 0, 1000000, state.v_total);
    const vr = sanitize(body.v_resonant, 0, 1000000, state.v_resonant);
    const et = sanitize(body.entropy, 0, 100, state.entropy);
    const strike_amount = sanitize(body.strike_amount, 0, 1000000, 0);
    const est_gas = sanitize(body.est_gas, 0, 10, 0);
    const is_resonant = !!body.is_resonant;

    const pythonPath = "/home/nous/aether_env/bin/python3";
    const scriptPath = "/home/nous/tmm_runtime.py";

    // 3. Secure Execution via execFileSync (no shell interpolation)
    const args = [
      scriptPath,
      "--v_total", vt.toString(),
      "--v_resonant", vr.toString(),
      "--entropy", et.toString(),
      "--strike_amount", strike_amount.toString(),
      "--est_gas", est_gas.toString()
    ];
    if (is_resonant) args.push("--is_resonant");

    const output = execFileSync(pythonPath, args).toString().trim();
    const lines = output.split("\n");
    const jsonOutput = lines[lines.length - 1];
    const result = JSON.parse(jsonOutput);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Oracle API Error:", error);
    return NextResponse.json({ 
      error: "TMM Runtime Error", 
      message: "Internal processing error. Ensure inputs are valid.",
      coherence: 0,
      threshold: 0.97404,
      phi_zeta: 0,
      psi_chi: 0,
      delta_gamma: 0.1,
      omega_q: 0.85,
      lambda_c: [-0.3, 0.3],
      approved: false,
      verdict: "SYSTEM_ERROR"
    }, { status: 500 });
  }
}
