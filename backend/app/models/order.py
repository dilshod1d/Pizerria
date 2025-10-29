from pydantic import BaseModel
from typing import Optional
from .status import Status

class OrderCreate(BaseModel):
    id: int
    pizza_type: str
    size: Optional[str] = None
    quantity: int = 1
    address: str

class Order(BaseModel):
    order_id: int
    pizza_type: str
    size: Optional[str]
    quantity: int
    address: str
    status: Status
