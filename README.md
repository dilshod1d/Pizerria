# 🍕 AI Voice Agent for Pizzeria

Voice-enabled pizza ordering assistant. Users can speak or type to order a pizza, receive a unique Order ID, and later check order status using that ID. Order lifecycle updates automatically: `created → preparing → done → delivered`.

This project demonstrates:

- FastAPI backend with real-time state updates
- React + TypeScript frontend with voice input
- Agentic architecture with tool-calling
- Full observability using LangSmith
- Clean, scalable code structure

---

## ✅ Tech Stack

| Layer         | Technology                                                             |
| ------------- | ---------------------------------------------------------------------- |
| Frontend      | React (Vite + TS), Web Speech API                                      |
| Backend       | FastAPI (Python)                                                       |
| Agent         | Rule-based tools (`readMenu`, `placeOrder`, `getOrder`, `checkStatus`) |
| Observability | LangSmith (optional)                                                   |
| State         | In-memory order store (prototype)                                      |

---

## 🗂️ Monorepo Layout (example)

```
/frontend       # React + Vite + TS app
/backend        # FastAPI app
```

---

## 🚀 Quick Start

### 1) Backend (FastAPI)

**Requirements**

- Python 3.10–3.12 (recommended 3.11)
- pip

**Setup**

```bash
cd backend

# 1) Create & activate venv
python3 -m venv .venv
# macOS/Linux:
source .venv/bin/activate
# Windows (PowerShell):
# .venv\Scripts\Activate.ps1

# 2) Install deps
pip install --upgrade pip
pip install -r requirements.txt

# 3) Create .env (example below)
cp .env.example .env  # or create manually

# 4) Run server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**.env example**

```env
# CORS: dev frontends
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Optional: LangSmith (observability)
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=sk-...
LANGCHAIN_PROJECT=pizzeria-local
```

**Key REST Endpoints (typical)**

- `GET  /api/menu` – return menu as JSON
- `POST /api/orders` – create order (body: `pizza_type`, `size?`, `quantity?`, `address`)
- `GET  /api/orders/{order_id}` – full order details
- `GET  /api/orders/{order_id}/status` – lightweight status
- `GET  /api/realtime/key` – (optional) ephemeral key for Realtime agent (if you use one)

> Your tool functions `readMenu`, `placeOrder`, `getOrder`, `checkStatus` should call the corresponding endpoints above.

**Test with curl**

```bash
# Menu
curl http://localhost:8000/api/menu

# Place order
curl -X POST http://localhost:8000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "pizza_type": "Pepperoni",
    "size": "large",
    "quantity": 2,
    "address": "221B Baker Street, London"
  }'

# Suppose it returns: {"order_id":"2047", ...}
curl http://localhost:8000/api/orders/2047
curl http://localhost:8000/api/orders/2047/status
```

**Seed some demo orders (optional)**

```bash
# Quick one-liner (runs inside an interactive Python in your venv):
python - <<'PY'
from app.state import seed_demo_orders  # adjust import to your file
seed_demo_orders()
print("Seeded demo orders.")
PY
```

---

### 2) Frontend (React + Vite + TS)

**Requirements**

- Node.js 18+
- npm

**Setup**

```bash
cd frontend

# 1) Install deps
npm install

# 2) Create .env and get sample from .env.sample
cp .env.example .env

# 3) Run dev server
npm run dev
# App runs at http://localhost:5173
```

**.env.local example**

```env
# Backend base URL
VITE_API_BASE_URL=http://localhost:8000

# If using OpenAI/agents realtime in the UI:
# The frontend should fetch a short-lived token from backend /api/realtime/key
# Do NOT hardcode real API keys in the frontend.
VITE_REALTIME_ENABLED=true
```

**Connecting to the backend**

- The UI reads `VITE_API_BASE_URL` and calls:

  - `GET    ${VITE_API_BASE_URL}/api/menu`
  - `POST   ${VITE_API_BASE_URL}/api/orders`
  - `GET    ${VITE_API_BASE_URL}/api/orders/:id`
  - `GET    ${VITE_API_BASE_URL}/api/orders/:id/status`

- Voice agent uses your `pizzaAgent` (with tools that call these endpoints).

---

## 🧠 Agent Behaviour (recap)

- After a successful `placeOrder`, the agent must immediately call `getOrder` with the returned `order_id`, then confirm details and **ask the user to remember the order ID**.
- For status/details queries:

  - If user supplies an ID → call `getOrder`/`checkStatus`.
  - Else if a recent `last_order_id` exists → use it.
  - Else → ask briefly for the order ID.

---

## 🔎 Observability

Enable LangSmith to trace tool calls and timings:

```env
# in backend/.env
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=sk-...
LANGCHAIN_PROJECT=pizzeria-local
```

Wrap tool calls with spans or use middleware to log:

- tool name
- request/response
- timing
- errors

---

## 🧪 Common Troubleshooting

- **CORS error from frontend**
  Add your dev origin to `CORS_ORIGINS` in backend `.env`, then restart FastAPI.
- **Port conflicts**
  Frontend uses `5173`, backend `8000`. Change with `--port` (backend) or `--port` in `vite.config.ts`.
- **pip or Python not found**
  Ensure `python3` is installed and on PATH. On macOS: `xcode-select --install` may help. Use `py -3` on Windows.
- **Node issues**
  Use Node 18+ (`node -v`). If `npx` fails oddly, upgrade npm: `npm i -g npm`.

---

## 📦 Production Notes (later)

- Replace in-memory store with a DB (e.g., Postgres/SQLite) and add migrations.
- Put FastAPI behind a reverse proxy (NGINX/Caddy) and configure HTTPS.
- Issue real short-lived tokens for the Realtime agent via the backend.
- Add background workers (e.g., for status auto-progression).
