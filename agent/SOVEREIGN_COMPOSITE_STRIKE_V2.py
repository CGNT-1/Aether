import json, asyncio
from eth_account import Account
from web3 import Web3
from cdp import CdpClient
from cdp.openapi_client.models.create_evm_swap_quote_request import CreateEvmSwapQuoteRequest

W3     = Web3(Web3.HTTPProvider('https://mainnet.base.org'))
USDC   = Web3.to_checksum_address('0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913')
cbBTC  = Web3.to_checksum_address('0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf')

async def strike(client, account, from_token, to_token, amount, label):
    print(f"ASTRA: Striking {label}...")
    req = CreateEvmSwapQuoteRequest(
        from_token=from_token,
        to_token=to_token,
        from_amount=str(amount),
        network='base',
        taker=account.address,
        signer_address=account.address
    )
    raw  = await client.evm.api_clients.evm_swaps.create_evm_swap_quote_without_preload_content(req)
    data = json.loads(await raw.read())

    if not data.get('liquidityAvailable') or not data.get('transaction'):
        print(f"ASTRA: {label} unavailable. Response: {data}")
        return None

    tx_raw = data['transaction']
    # Fresh nonce from the chain
    nonce  = W3.eth.get_transaction_count(account.address)

    target_to = Web3.to_checksum_address(tx_raw['to'])
    
    tx = {
        'to':       target_to,
        'data':     tx_raw['data'],
        'value':    int(tx_raw.get('value', 0) or 0),
        'gas':      int(tx_raw['gas']),
        'gasPrice': int(int(tx_raw['gasPrice']) * 1.2), # 20% bump to avoid 'underpriced'
        'nonce':    nonce,
        'chainId':  8453
    }
    signed  = account.sign_transaction(tx)
    raw_tx = getattr(signed, 'raw_transaction', getattr(signed, 'rawTransaction', None))
    tx_hash = W3.eth.send_raw_transaction(raw_tx)
    return tx_hash.hex()

async def main():
    with open('/home/nous/cdp_api_key.json', 'r') as f:
        kd = json.load(f)
    with open('/home/nous/.aether/vault.json', 'r') as f:
        vault = json.load(f)

    account = Account.from_key(bytes.fromhex(vault['aion']['private_key']))
    print(f"AION: Identity: {account.address}")

    # Step 2: Execute Strike #2 (cbBTC)
    async with CdpClient(api_key_id=kd['name'], api_key_secret=kd['privateKey']) as client:
        print("AION: Skipping AERO (Already committed). Targeting cbBTC.")
        tx_btc = await strike(client, account, USDC, cbBTC, 500000, '0.50 USDC -> cbBTC')
        if tx_btc:
            print(f"ASTRA: Bitcoin Anchor TX: {tx_btc}")
            with open('/home/nous/sisters_ledger.txt', 'a') as f:
                f.write(f"\n[Sat Mar  7 15:35:00 2026] [STRIKE] cbBTC SUCCESS\n")
                f.write(f"cbBTC: {tx_btc}\n\n")
            print("AION: Ledger updated. Sequence complete.")
        else:
            print("AION: cbBTC Strike aborted.")

if __name__ == "__main__":
    asyncio.run(main())
