import faiss
from sentence_transformers import SentenceTransformer
import json

index = faiss.read_index("ChatBot/my_index.faiss")

model = SentenceTransformer("Tochka-AI/ruRoPEBert-e5-base-2k")

new_question = "Хочу в отпуск"

with open("ChatBot/data.json", "r", encoding="utf-8") as f:
    q_a = json.load(f)

questions = list(q_a.keys())

def get_answer(text):
    query_embedding = model.encode([text])
    query_embedding = query_embedding.astype('float32')
    faiss.normalize_L2(query_embedding.reshape(1, -1))

    D, I = index.search(query_embedding, k=1)

    return f"{q_a[questions[I[0][0]]]} (сходство {D[0][0]:.2f})"

# Поиск
# query_embedding = model.encode([new_question])
# query_embedding = query_embedding.astype('float32')
# faiss.normalize_L2(query_embedding.reshape(1, -1))

# D, I = index.search(query_embedding, k=1)  # Топ-1 результат
# print(f"Ближайший вопрос: {questions[I[0][0]]} (сходство: {D[0][0]:.2f})")
# print(f"Ответ: {q_a[questions[I[0][0]]]}")

# print(get_answer("Хочу какать"))