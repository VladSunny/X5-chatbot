import numpy as np
from transformers import AutoTokenizer, AutoModel
import torch
import numpy as np
import faiss
import json
from tqdm import tqdm

index = faiss.read_index("ChatBot/my_index.faiss")

tokenizer = AutoTokenizer.from_pretrained("ChatBot/models", trust_remote_code=True)
model = AutoModel.from_pretrained("ChatBot/models", trust_remote_code=True)

with open("ChatBot/data.json", "r", encoding="utf-8") as f:
    q_a = json.load(f)

questions = list(q_a.keys())

def get_embeddings(texts, batch_size=32, log=False):
    embeddings = []
    for i in tqdm(range(0, len(texts), batch_size), disable=(not log)):
        batch = texts[i:i+batch_size]
        inputs = tokenizer(batch, padding=True, truncation=True, 
                         return_tensors="pt", max_length=512)
        with torch.no_grad():
            outputs = model(**inputs)
        # Усреднение по токенам
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
        return f"Не уверен, что понял вас, попробуйте добавить в вопрос больше ключевых слов"


# print(get_answer("Как получить отпуск?"))
