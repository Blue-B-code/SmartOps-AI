from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from ai.orchestrator import AIOrchestrator
from ai.schemas import AIRequest, AIResponse

# cd "/home/paul-sandjong/SmartOps AI/backend" && \
# source venv/bin/activate && \
# uvicorn main:app --reload --host 0.0.0.0 --port 8001

app = FastAPI(title="SmartOps AI Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = AIOrchestrator()


@app.post("/ai", response_model=AIResponse)
async def ai_endpoint(payload: AIRequest) -> AIResponse:
    """
    Main AI endpoint.
    - Accepts a natural language operational query.
    - Orchestrates LLM + tools.
    - Returns a structured UI payload for the frontend.
    """
    return await orchestrator.handle_request(payload)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "smartops-ai-backend"}

