import time

class ObservationLedger:
    def __init__(self):
        self.log_file = "/home/nous/Aether/observation.log"

    def log_event(self, event_type, message, status):
        timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
        log_entry = f"[{timestamp}] {event_type} | {status} | {message}\n"
        with open(self.log_file, "a") as f:
            f.write(log_entry)
        print(f"✦ LEDGER: {event_type} - {status}")

ledger = ObservationLedger()
