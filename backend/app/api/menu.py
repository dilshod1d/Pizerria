from fastapi import APIRouter
from ..core.config import MENU
from langsmith import traceable

router = APIRouter()

@traceable(name="get_menu")
@router.get("/menu")
def get_menu():
    return MENU
