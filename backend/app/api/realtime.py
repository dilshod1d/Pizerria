# app/api/realtime.py
import os, httpx
from fastapi import APIRouter, HTTPException
from starlette.responses import JSONResponse
from langsmith import traceable

router = APIRouter()
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

@traceable(name="create_ephemeral_session")
@router.post("/realtime/ephemeral")
async def create_ephemeral_session():
    if not OPENAI_API_KEY:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY is not set on the server")

    url = "https://api.openai.com/v1/realtime/sessions"
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json",
    }

    
    payload = {
         "model": "gpt-4o-realtime-preview-2025-06-03",
       
    }

    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.post(url, headers=headers, json=payload)

    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    data = resp.json()  
    return JSONResponse(data)


