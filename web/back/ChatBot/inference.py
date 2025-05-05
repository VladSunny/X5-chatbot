import os
import numpy as np
from transformers import AutoTokenizer, AutoModel
import torch
import faiss
import json
from tqdm import tqdm

MODEL_DIR = "ChatBot/models"
INDEX_PATH = "ChatBot/my_index.faiss"
DATA_PATH = "ChatBot/data.json"
MODEL_NAME = "jinaai/jina-embeddings-v3"

os.makedirs(MODEL_DIR, exist_ok=True)

if not os.path.exists(os.path.join(MODEL_DIR, "config.json")):
    print("Модель не найдена — загружаю и сохраняю...")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=True)
    model = AutoModel.from_pretrained(MODEL_NAME, trust_remote_code=True)
    tokenizer.save_pretrained(MODEL_DIR)
    model.save_pretrained(MODEL_DIR)
else:
    tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR, trust_remote_code=True)
    model = AutoModel.from_pretrained(MODEL_DIR, trust_remote_code=True)

with open(DATA_PATH, "r", encoding="utf-8") as f:
    q_a = json.load(f)
questions = list(q_a.keys())

if os.path.exists(INDEX_PATH):
    index = faiss.read_index(INDEX_PATH)
else:
    print("Индекс не найден — создаю новый...")
    embeddings = []

    for i in tqdm(range(0, len(questions), 32)):
        batch = questions[i:i + 32]
        inputs = tokenizer(batch, padding=True, truncation=True,
                           return_tensors="pt", max_length=512)
        with torch.no_grad():
            outputs = model(**inputs)
        batch_embeddings = outputs.last_hidden_state.mean(dim=1).numpy()
        embeddings.append(batch_embeddings)

    embeddings = np.vstack(embeddings).astype("float32")
    faiss.normalize_L2(embeddings)
    index = faiss.IndexFlatIP(embeddings.shape[1])
    index.add(embeddings)
    faiss.write_index(index, INDEX_PATH)

def get_embeddings(texts, batch_size=32, log=False):
    embeddings = []
    for i in tqdm(range(0, len(texts), batch_size), disable=not log):
        batch = texts[i:i + batch_size]
        inputs = tokenizer(batch, padding=True, truncation=True,
                           return_tensors="pt", max_length=512)
        with torch.no_grad():
            outputs = model(**inputs)
        batch_embeddings = outputs.last_hidden_state.mean(dim=1).numpy()
        embeddings.append(batch_embeddings)
    return np.vstack(embeddings)

def get_answer(text):
    query_embedding = get_embeddings([text])
    query_embedding = query_embedding.astype('float32')
    faiss.normalize_L2(query_embedding.reshape(1, -1))

    D, I = index.search(query_embedding, k=1)
    if D[0][0] >= 0.61:
        return f"{q_a[questions[I[0][0]]]} (уверенность {D[0][0]:.2f})"
    else:
        return "Не уверен, что понял вас, попробуйте добавить в вопрос больше ключевых слов"
