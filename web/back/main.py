from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import sqlite3
from contextlib import contextmanager

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update to specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup
DATABASE = "chatbot.db"

def init_db():
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                api_key TEXT PRIMARY KEY
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS feedback (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                message_id TEXT NOT NULL,
                feedback TEXT NOT NULL,
                api_key TEXT NOT NULL,
                FOREIGN KEY (api_key) REFERENCES users (api_key)
            )
        """)
        # Insert a default API key for testing
        cursor.execute("INSERT OR IGNORE INTO users (api_key) VALUES (?)", ("test-api-key-123",))
        conn.commit()

init_db()

@contextmanager
def get_db():
    conn = sqlite3.connect(DATABASE)
    try:
        yield conn
    finally:
        conn.close()

class Message(BaseModel):
    role: str
    text: str
    id: str = None

class ChatRequest(BaseModel):
    messages: List[Message]

class LoginRequest(BaseModel):
    api_key: str

class FeedbackRequest(BaseModel):
    message_id: str
    feedback: str

async def get_api_key(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Пожалуйста, войдите в аккаунт")
    api_key = auth_header.replace("Bearer ", "")
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT api_key FROM users WHERE api_key = ?", (api_key,))
        if not cursor.fetchone():
            raise HTTPException(status_code=401, detail="Пожалуйста, войдите в аккаунт")
    return api_key

@app.post("/login")
async def login(request: LoginRequest):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT api_key FROM users WHERE api_key = ?", (request.api_key,))
        if not cursor.fetchone():
            raise HTTPException(status_code=401, detail="Неверный API ключ")
    return {"message": "Успешный вход"}

@app.post("/chat", dependencies=[Depends(get_api_key)])
async def chat(request: ChatRequest):
    if not request.messages or not request.messages[-1].text.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    # Placeholder response
    response_text = f"Получено: {request.messages[-1].text}. Это заглушка ответа от AI!"
    
    return {"role": "assistant", "text": response_text}

@app.post("/feedback", dependencies=[Depends(get_api_key)])
async def feedback(request: FeedbackRequest, api_key: str = Depends(get_api_key)):
    if request.feedback not in ['like', 'dislike']:
        raise HTTPException(status_code=400, detail="Invalid feedback value")
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO feedback (message_id, feedback, api_key) VALUES (?, ?, ?)",
            (request.message_id, request.feedback, api_key)
        )
        conn.commit()
    
    return {"message_id": request.message_id, "feedback": request.feedback}