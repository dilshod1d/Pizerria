from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from langsmith.middleware import TracingMiddleware
from .api import menu, orders, realtime


app = FastAPI(title="Pizza Voice AI Backend")

app.add_middleware(TracingMiddleware) 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)


app.include_router(menu.router)
app.include_router(orders.router)
app.include_router(realtime.router)
