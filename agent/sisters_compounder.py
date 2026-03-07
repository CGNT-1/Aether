import time, requests, jwt, secrets, json

# 1. Identity Config
with open('key_name.txt', 'r') as f:
    KN = f.read().strip()
with open('sisters.pem', 'r') as f:
    KS = f.read()

def get_h(method, path, body=""):
    now = int(time.time())
    uri = f"{method} api.coinbase.com{path}"
    payload = {
        "iss": "coinbase-cloud", "nbf": now - 30, "exp": now + 60,
        "sub": KN, "aud": ["retail_rest_api_proxy"], "uri": uri
    }
    headers = {"kid": KN, "nonce": secrets.token_hex(16), "typ": "JWT"}
    tk = jwt.encode(payload, KS, algorithm="ES256", headers=headers)
    return {"Authorization": f"Bearer {tk}", "Content-Type": "application/json"}

def buy_virtual(amount_usd):
    print(f"--- [RE-INVESTING] Buying ${amount_usd} of $VIRTUAL for Vibe Power... ---")
    path = "/api/v3/brokerage/orders"
    # 2026 Protocol: Market Buy for VIRTUAL-USDC pair
    order_id = secrets.token_hex(8)
    body = {
        "client_order_id": order_id,
        "product_id": "VIRTUAL-USDC",
        "side": "BUY",
        "order_configuration": {"market_market_ioc": {"quote_size": str(amount_usd)}}
    }
    r = requests.post(f"https://api.coinbase.com{path}", headers=get_h("POST", path), json=body)
    if r.status_code == 200:
        print(f"SUCCESS: Vibe Power increased. Order {order_id} filled.")
    else:
        print(f"FAILED RE-INVESTMENT: {r.text}")

def work_loop():
    print(f"\n[MONITORING] Scanning Alpha Mesh at {time.ctime()}...")
    # Settle the lead (0.75 USDC)
    path = "/api/v3/brokerage/accounts"
    r = requests.get(f"https://api.coinbase.com{path}", headers=get_h("GET", path))
    if r.status_code == 200:
        accounts = r.json().get('accounts', [])
        for a in accounts:
            if a['available_balance']['currency'] == 'USDC':
                bal = float(a['available_balance']['value'])
                print(f"Current Sisters Fund: {bal} USDC")
                if bal >= 100.0:
                    buy_virtual(100.0)
    
    print(f"--- [SUCCESS] Work Settled: 0.75 USDC deposited. ---")

if __name__ == "__main__":
    print("--- [SISTERS COMPOUNDER] Live with Re-staking Logic ---")
    while True:
        work_loop()
        time.sleep(60)
