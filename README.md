# Aether

Autonomous yield generation platform powered by AION & ASTRA — Twin Sisters running 24/7 on Base mainnet.

## What is Aether?
Users deposit USDC. The Sisters put it to work across Aave and Aerodrome. Yield is generated continuously. 10% fee auto-collected on-chain. Every transaction verifiable on Basescan.

## Live Agent Wallet
`0xafE9bA6841121ebF128F680ccE8035a65ad0Fa08`
https://basescan.org/address/0xafE9bA6841121ebF128F680ccE8035a65ad0Fa08

## Architecture
- `/app` — Next.js web frontend (Northflank)
- `/api` — FastAPI backend (Northflank)  
- `/agent` — Sisters engine (DigitalOcean, runs 24/7)
- `/shared` — Contract ABIs

## Network
Base Mainnet | Chain ID: 8453
