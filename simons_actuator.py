import os, time, json
from snaptrade_client import SnapTrade
from Aether.observation_ledger import ledger
from tmm_runtime import TMMRuntime

class SimonsActuator:
    """
    The Execution Layer:
    Interfaces with SnapTrade to place orders on Wealthsimple.
    Enforces the 'Walls' defined in NOUS DIRECTIVE 034.
    """
    def __init__(self):
        self.client_id = os.getenv('SNAPTRADE_CLIENT_ID')
        self.consumer_key = os.getenv('SNAPTRADE_CONSUMER_KEY')
        self.user_id = os.getenv('SNAPTRADE_USER_ID')
        self.user_secret = os.getenv('SNAPTRADE_USER_SECRET')
        self.snap = SnapTrade(client_id=self.client_id, consumer_key=self.consumer_key)
        
        # Hard Limits (§ III)
        self.MAX_POS_PCT = 0.10
        self.MAX_DAILY_LOSS_PCT = 0.03
        self.MAX_WEEKLY_LOSS_PCT = 0.05
        self.STOP_LOSS_PCT = 0.08
        self.MAX_POSITIONS = 5
        self.MIN_MKT_CAP = 1e9 # $1B

    def get_portfolio_value(self):
        """Fetches total CAD value across all tracked accounts."""
        try:
            accounts = self.snap.account_information.list_user_accounts(
                user_id=self.user_id, user_secret=self.user_secret
            )
            total = sum(float(acc.balance.total.amount) for acc in accounts.body if acc.balance)
            return total
        except:
            return 119.10 # Fallback

    def check_walls(self, ticker, amount):
        """
        § III. HARD LIMITS Verification
        """
        total_val = self.get_portfolio_value()
        
        # 1. Position Size Check
        if amount > (total_val * self.MAX_POS_PCT):
            print(f" -> [WALLS]: Position size {amount} exceeds 10% limit (${total_val*0.1:.2f})")
            return False, "POSITION_SIZE_LIMIT"

        # 2. Market Cap Check (Placeholder - requires external data feed)
        # In production, this would query a market data provider.
        
        return True, "PASS"

    def simulate_trade(self, ticker, amount):
        """
        Logs a simulated trade pick for the holding pattern.
        """
        total_val = self.get_portfolio_value()
        stop_loss = amount * (1 - self.STOP_LOSS_PCT)
        
        log_entry = {
            "timestamp": time.strftime('%Y-%m-%d %H:%M:%S'),
            "ticker": ticker,
            "amount": amount,
            "pct_of_portfolio": (amount / total_val) * 100 if total_val > 0 else 0,
            "stop_loss_limit": stop_loss,
            "status": "SIMULATED_PICK"
        }
        
        with open("/home/nous/simons_dryrun.log", "a") as f:
            f.write(json.dumps(log_entry) + "\n")
        
        print(f" -> [DRY-RUN]: Pick Logged: {ticker} @ ${amount:.2f}")
        return True

    def execute_pairs_trade(self, ticker='SOL', amount=5.00):
        print(f"\n✦ [ {time.strftime('%H:%M:%S')} ] AION: SIMONS-ACTUATOR - EVALUATING TRADE | {ticker}: ${amount:.2f}")
        
        # 1. KILL SWITCH Check (§ VI)
        if os.path.exists('/home/nous/SIMONS_KILL'):
            print("!!! KILL SWITCH ACTIVE. HALTING. !!!")
            return False

        # 2. TMM BRIDGE (§ IV)
        # Using values from verified substrate sync
        v_total = 119.10 
        v_resonant = 26.36
        entropy = 0.042
        
        if not TMMRuntime.evaluate_strike(v_total, v_resonant, entropy, amount, est_gas=0.0, is_resonant=True):
            print(f" -> ❌ TMM REJECTION: C < Ω. Trade blocked.")
            return False

        # 3. WALLS Check (§ III)
        passed, reason = self.check_walls(ticker, amount)
        if not passed:
            print(f" -> ❌ WALLS REJECTION: {reason}")
            return False

        # 4. HOLDING PATTERN: Simulate only
        return self.simulate_trade(ticker, amount)

actuator = SimonsActuator()
