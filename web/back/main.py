from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import sqlite3
from contextlib import contextmanager
import uuid

app = FastAPI()

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

@app.get("/messages", dependencies=[Depends(get_api_key)])
async def get_messages(api_key: str = Depends(get_api_key)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT role, text, message_id FROM messages WHERE api_key = ?", (api_key,))
        messages = [{"role": row[0], "text": row[1], "id": row[2]} for row in cursor.fetchall()]
    return {"messages": messages}

@app.post("/chat", dependencies=[Depends(get_api_key)])
async def chat(request: ChatRequest, api_key: str = Depends(get_api_key)):
    if not request.messages or not request.messages[-1].text.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    user_message = request.messages[-1]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO messages (api_key, role, text, message_id) VALUES (?, ?, ?, ?)",
            (api_key, user_message.role, user_message.text, user_message.id)
        )
        conn.commit()
    
    response_text = f"Получено: {user_message.text}. Это заглушка ответа от AI!"
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
async def feedback(request: FeedbackRequest, api_key: str = Depends(get_api_key)):
    if request.feedback not in ['like', 'dislike']:
        raise HTTPException(status_code=400, detail="Invalid feedback value")
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT feedback FROM feedback WHERE message_id = ? AND api_key = ?",
            (request.message_id, api_key)
        )
        existing_feedback = cursor.fetchone()
        
        if existing_feedback:
            cursor.execute(
                "UPDATE feedback SET feedback = ? WHERE message_id = ? AND api_key = ?",
                (request.feedback, request.message_id, api_key)
            )
        else:
            cursor.execute(
                "INSERT INTO feedback (message_id, feedback, api_key) VALUES (?, ?, ?)",
                (request.message_id, request.feedback, api_key)
            )
        conn.commit()
    
    return {"message_id": request.message_id, "feedback": request.feedback}

@app.delete("/clear_chat", dependencies=[Depends(get_api_key)])
async def clear_chat(api_key: str = Depends(get_api_key)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM messages WHERE api_key = ?", (api_key,))
        cursor.execute("DELETE FROM feedback WHERE api_key = ?", (api_key,))
        conn.commit()
    return {"message": "Chat history cleared"}