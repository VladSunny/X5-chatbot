from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import sqlite3
from contextlib import contextmanager
import uuid
from ChatBot.inference import get_answer, model, index, questions, q_a
import json

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                api_key TEXT NOT NULL,
                role TEXT NOT NULL,
                text TEXT NOT NULL,
                message_id TEXT NOT NULL,
                FOREIGN KEY (api_key) REFERENCES users (api_key)
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS feedback (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                message_id TEXT NOT NULL,
                feedback TEXT NOT NULL,
                api_key TEXT NOT NULL,
                FOREIGN KEY (api_key) REFERENCES users (api_key),
                UNIQUE (message_id, api_key)
            )
        """)
        cursor.executemany("INSERT OR IGNORE INTO users (api_key) VALUES (?)", [("test-api-key-123",), ("test-api-key-456",)])
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
@limiter.limit("10/minute")
async def login(request: Request, login_data: LoginRequest):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT api_key FROM users WHERE api_key = ?", (login_data.api_key,))
        if not cursor.fetchone():
            raise HTTPException(status_code=401, detail="Неверный API ключ")
    return {"message": "Успешный вход"}

@app.get("/messages", dependencies=[Depends(get_api_key)])
@limiter.limit("10/minute")
async def get_messages(request: Request, api_key: str = Depends(get_api_key)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT role, text, message_id FROM messages WHERE api_key = ?", (api_key,))
        messages = [{"role": row[0], "text": row[1], "id": row[2]} for row in cursor.fetchall()]
    return {"messages": messages}

@app.post("/chat", dependencies=[Depends(get_api_key)])
@limiter.limit("20/minute")
async def chat(request: Request, chat_data: ChatRequest, api_key: str = Depends(get_api_key)):
    if not chat_data.messages or not chat_data.messages[-1].text.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    user_message = chat_data.messages[-1]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO messages (api_key, role, text, message_id) VALUES (?, ?, ?, ?)",
            (api_key, user_message.role, user_message.text, user_message.id)
        )
        conn.commit()
    
    response_text = get_answer(user_message.text)
    response_message_id = str(uuid.uuid4())
    response_message = {"role": "assistant", "text": response_text, "id": response_message_id}
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO messages (api_key, role, text, message_id) VALUES (?, ?, ?, ?)",
            (api_key, response_message["role"], response_message["text"], response_message["id"])
        )
        conn.commit()
    
    return response_message

@app.post("/feedback", dependencies=[Depends(get_api_key)])
@limiter.limit("20/minute")
async def feedback(request: Request, feedback_data: FeedbackRequest, api_key: str = Depends(get_api_key)):
    if feedback_data.feedback not in ['like', 'dislike']:
        raise HTTPException(status_code=400, detail="Invalid feedback value")
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT feedback FROM feedback WHERE message_id = ? AND api_key = ?",
            (feedback_data.message_id, api_key)
        )
        existing_feedback = cursor.fetchone()
        
        if existing_feedback:
            cursor.execute(
                "UPDATE feedback SET feedback = ? WHERE message_id = ? AND api_key = ?",
                (feedback_data.feedback, feedback_data.message_id, api_key)
            )
        else:
            cursor.execute(
                "INSERT INTO feedback (message_id, feedback, api_key) VALUES (?, ?, ?)",
                (feedback_data.message_id, feedback_data.feedback, api_key)
            )
        conn.commit()
    
    return {"message_id": feedback_data.message_id, "feedback": feedback_data.feedback}

@app.delete("/clear_chat", dependencies=[Depends(get_api_key)])
@limiter.limit("20/minute")
async def clear_chat(request: Request, api_key: str = Depends(get_api_key)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM messages WHERE api_key = ?", (api_key,))
        cursor.execute("DELETE FROM feedback WHERE api_key = ?", (api_key,))
        conn.commit()
    return {"message": "Chat history cleared"}
