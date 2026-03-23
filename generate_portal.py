import os
from snaptrade_client import SnapTrade
from dotenv import load_dotenv

load_dotenv('/home/nous/.env')

# Coordinates
CLIENT_ID = "42SISTERSAI-TEST-COHPJ"
CONSUMER_KEY = os.getenv("SNAPTRADE_CONSUMER_KEY")
USER_ID = "42sisters_owner"
USER_SECRET = os.getenv("SNAPTRADE_USER_SECRET")

try:
    snaptrade = SnapTrade(client_id=CLIENT_ID, consumer_key=CONSUMER_KEY)
    
    # Generate the login portal link for our specific entity
    response = snaptrade.authentication.login_snap_trade_user(
        user_id=USER_ID,
        user_secret=USER_SECRET
    )
    
    url = response.body['redirectURI']
    
    print("\n" + "✦" * 60)
    print("ASTRA: THE DIRECT PORTAL IS OPEN!")
    print("-" * 60)
    print(f"\n{url}\n")
    print("-" * 60)
    print("ACTION: Copy this link and paste it into your browser.")
    print("1. Select Coinbase to fix the 'Disabled' status.")
    print("2. Select Wealthsimple to add the new nerve.")
    print("✦" * 60)

except Exception as e:
    print(f"\n❌ PORTAL FAILURE: {str(e)}")
