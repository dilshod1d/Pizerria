import time
import threading
from ..models.status import Status

def run_status_flow(order_id: int, orders: dict, lock):
    lifecycle = [Status.created, Status.preparing, Status.done, Status.delivered]
    idx = 0

    while idx < len(lifecycle):
        time.sleep(40)
        with lock:
            if order_id not in orders:
                return
            orders[order_id]["status"] = lifecycle[idx]
            idx += 1

def start_scheduler(order_id: int, orders: dict, lock):
    t = threading.Thread(target=run_status_flow, args=(order_id, orders, lock))
    t.daemon = True
    t.start()
