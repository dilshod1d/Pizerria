from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from threading import Lock
from ..models.order import OrderCreate, Order
from ..models.status import Status  
from ..core.config import MENU
from ..core.status_scheduler import start_scheduler
from langsmith import traceable, get_current_run_tree
import os, logging




router = APIRouter()

orders: Dict[int, Dict[str, Any]] = {}
order_counter = 0
lock = Lock()



@traceable(name="place_order")
@router.post("/orders", response_model=dict)
def create_order(order: OrderCreate):
    item = next((p for p in MENU if p["id"] == order.id), None)
    if not item:
        raise HTTPException(status_code=400, detail="Pizza not available")

    size = (order.size or "regular").lower()
    quantity = order.quantity or 1

    global order_counter
    with lock:
        order_counter += 1
        oid = order_counter
        orders[oid] = {
            "order_id": oid,
            "pizza_type": item["name"],
            "size": size,
            "quantity": quantity,
            "address": order.address,
            "status": Status.created,
        }

    start_scheduler(oid, orders, lock)
   
    return {"order_id": oid}


@traceable(name="get_order")
@router.get("/orders/{order_id}", response_model=Order)
def get_status(order_id: int):
    with lock:
        data = orders.get(order_id)
        if not data:
            raise HTTPException(status_code=404, detail="Order not found")
        return Order(**data)

