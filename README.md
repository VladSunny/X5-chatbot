# X5 Chatbot

[Русская версия](#ru) | [English version](#en)

Employee support chatbot built as a team full-stack case project for the X5 Tech bootcamp. The system answers internal bureaucratic questions by retrieving the closest match from a Q&A knowledge base using semantic embeddings, FAISS, and cosine similarity.

## Русская версия

### О проекте

`X5 Chatbot` это full-stack проект, который мы сделали командой в рамках кейса от `X5 Tech` на буткемпе `Senior КодИИМ`.

Идея проекта: дать сотрудникам внутреннего контура чатбота, в который можно писать бюрократические и справочные вопросы. В основе решения не генеративная LLM-логика, а retrieval-подход: поиск наиболее похожего вопроса в базе `вопрос-ответ` по эмбеддингам и cosine similarity.

### Задача

На входе был датасет формата `question -> answer`. Нужно было собрать прикладное решение, которое:

* принимает вопрос сотрудника через чат-интерфейс;
* находит ближайший вопрос из базы знаний;
* возвращает готовый ответ, если уверенность достаточно высокая;
* уходит в fallback, если совпадение слишком слабое.

### Решение

Архитектура проекта состоит из трёх частей:

* `Frontend`: чат-интерфейс на `React + Vite` с авторизацией по API key, историей сообщений в `localStorage`, отправкой фидбека и модальным окном глоссария.
* `Backend`: API на `FastAPI` с эндпоинтами `/login`, `/chat`, `/feedback`, ограничением частоты запросов и хранением пользовательского фидбека в `SQLite`.
* `ML / Retrieval`: эмбеддинги вопросов, индекс `FAISS`, поиск ближайшего соседа по cosine similarity и возврат готового ответа из словаря `question -> answer`.

### Наш вклад

Это `team full-stack` проект. Мы полностью сделали:

* продуктовую декомпозицию кейса;
* retrieval-логику на эмбеддингах и `FAISS`;
* backend API и хранение фидбека;
* frontend чат-интерфейс;
* структуру проекта и деплой-конфигурацию.

### Стек

* `Python`, `FastAPI`, `Uvicorn`
* `Transformers`, `Torch`, `FAISS`
* `SQLite`
* `React`, `Vite`, `Tailwind CSS`
* `Render` для backend deployment-конфига

### Как это работает

1. Вопросы из базы знаний загружаются из `data.json`.
2. Для вопросов строятся эмбеддинги моделью `jinaai/jina-embeddings-v3`.
3. Эмбеддинги нормализуются и индексируются в `FAISS`.
4. Пользователь отправляет вопрос через чат.
5. Backend строит эмбеддинг запроса и ищет `top-1` ближайший вопрос в индексе.
6. Если similarity выше порога `0.61`, пользователю возвращается готовый ответ из базы.
7. Если порог не достигнут, бот отвечает fallback-сообщением и просит уточнить вопрос.

Это делает систему простой, дешёвой в эксплуатации и предсказуемой по поведению на FAQ-подобных запросах.

### Что показывает проект

Этот репозиторий хорошо демонстрирует несколько типов задач сразу:

* разработку прикладного AI-сервиса без избыточной генеративной сложности;
* full-stack сборку продукта от интерфейса до inference-слоя;
* работу с retrieval-пайплайном на эмбеддингах;
* сбор пользовательского фидбека для последующего улучшения базы знаний;
* умение упаковать прототип в демонстрационный сервис.

### Структура репозитория

```text
.
├── ML/                         # ноутбуки, эксперименты и артефакты
├── web/
│   ├── back/                   # FastAPI backend + retrieval inference
│   │   ├── ChatBot/
│   │   │   ├── data.json
│   │   │   ├── inference.py
│   │   │   └── my_index.faiss
│   │   ├── main.py
│   │   └── requirements.txt
│   └── front/x5-chatbot/       # React frontend
├── render.yaml                 # backend deployment config
└── README.md

```

### Локальный запуск

#### Backend

```bash
cd web/back
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload

```

Backend поднимется на `http://127.0.0.1:8000`.

#### Frontend

```bash
cd web/front/x5-chatbot
npm install
npm run dev

```

#### Важная оговорка

Сейчас frontend-код отправляет запросы на захардкоженный backend URL `https://vladg00dman.website/...`, а не на локальный `localhost`. Для полностью локального запуска нужно заменить базовые URL в [web/front/x5-chatbot/src/components/ChatWindow.jsx](https://www.google.com/search?q=/home/vladg00dman/Projects/Temp/X5-chatbot/web/front/x5-chatbot/src/components/ChatWindow.jsx) и [web/front/x5-chatbot/src/components/LoginModal.jsx](https://www.google.com/search?q=/home/vladg00dman/Projects/Temp/X5-chatbot/web/front/x5-chatbot/src/components/LoginModal.jsx).

### Ограничения

* Решение retrieval-only и не умеет генерировать новые ответы.
* Качество напрямую зависит от покрытия датасета `question -> answer`.
* Используется `top-1` поиск без reranking.
* Порог similarity зафиксирован в коде.
* В репозитории нет полноценного production-ready контура конфигурации и автоматических тестов.

### Что можно улучшить дальше

* вынести API base URL в переменные окружения;
* добавить оценку качества retrieval на валидационном наборе;
* хранить и анализировать пользовательский фидбек для дообогащения базы;
* поддержать `top-k` retrieval и reranking;
* добавить observability, тесты и контейнеризацию полного контура.

## English version

### About

`X5 Chatbot` is a team full-stack project built for an `X5 Tech` bootcamp case.

The goal was to build an internal employee-support chatbot for bureaucratic and FAQ-style questions. The system is not a generative LLM assistant. Instead, it uses semantic retrieval: it finds the closest known question in a `question -> answer` dataset using embeddings and cosine similarity, then returns the linked answer.

### Challenge

The starting point was a structured Q&A dataset. The task was to turn it into a practical product prototype that:

* accepts employee questions through a chat interface;
* searches the internal knowledge base for the nearest matching question;
* returns a ready-made answer when confidence is high enough;
* falls back gracefully when the match is too weak.

### Solution

The project consists of three main layers:

* `Frontend`: a `React + Vite` chat UI with API key login, local chat history, feedback actions, and a glossary modal.
* `Backend`: a `FastAPI` service with `/login`, `/chat`, and `/feedback` endpoints, rate limiting, and `SQLite` storage for feedback-related records.
* `ML / Retrieval`: question embeddings, a `FAISS` index, nearest-neighbor search by cosine similarity, and answer lookup from the `question -> answer` mapping.

### Our role

This is a `team full-stack` project. We built:

* solution decomposition for the bootcamp case;
* the embeddings + `FAISS` retrieval pipeline;
* backend API and feedback storage;
* the frontend chat application;
* project structure and deployment configuration.

### Tech stack

* `Python`, `FastAPI`, `Uvicorn`
* `Transformers`, `Torch`, `FAISS`
* `SQLite`
* `React`, `Vite`, `Tailwind CSS`
* `Render` backend deployment config

### How it works

1. The knowledge base is loaded from `data.json`.
2. Question embeddings are generated with `jinaai/jina-embeddings-v3`.
3. Embeddings are normalized and indexed in `FAISS`.
4. A user sends a question in the chat UI.
5. The backend embeds the query and performs `top-1` nearest-neighbor search.
6. If similarity is above the `0.61` threshold, the linked answer is returned.
7. If the threshold is not met, the bot returns a fallback clarification message.

This makes the system simple, explainable, and inexpensive to run for FAQ-style use cases.

### What this project demonstrates

The repository shows several kinds of engineering work in one case:

* building an applied AI service without unnecessary generative complexity;
* delivering a product end to end, from UI to inference;
* working with an embedding-based retrieval pipeline;
* collecting user feedback for future knowledge-base improvements;
* packaging a prototype into a demo-ready service.

### Repository structure

```text
.
├── ML/                         # notebooks, experiments, artifacts
├── web/
│   ├── back/                   # FastAPI backend + retrieval inference
│   │   ├── ChatBot/
│   │   │   ├── data.json
│   │   │   ├── inference.py
│   │   │   └── my_index.faiss
│   │   ├── main.py
│   │   └── requirements.txt
│   └── front/x5-chatbot/       # React frontend
├── render.yaml                 # backend deployment config
└── README.md

```

### Local setup

#### Backend

```bash
cd web/back
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload

```

The backend starts on `http://127.0.0.1:8000`.

#### Frontend

```bash
cd web/front/x5-chatbot
npm install
npm run dev

```

#### Important note

The current frontend sends requests to the hardcoded backend URL `https://vladg00dman.website/...` instead of local `localhost`. For a fully local setup, update the endpoint URLs in [web/front/x5-chatbot/src/components/ChatWindow.jsx](https://www.google.com/search?q=/home/vladg00dman/Projects/Temp/X5-chatbot/web/front/x5-chatbot/src/components/ChatWindow.jsx) and [web/front/x5-chatbot/src/components/LoginModal.jsx](https://www.google.com/search?q=/home/vladg00dman/Projects/Temp/X5-chatbot/web/front/x5-chatbot/src/components/LoginModal.jsx).

### Limitations

* The system is retrieval-only and does not generate new answers.
* Answer quality depends on knowledge-base coverage.
* Retrieval is `top-1` only and does not use reranking.
* The similarity threshold is hardcoded.
* The repository does not yet include a full production-grade configuration or automated tests.

### Possible next steps

* move API base URLs to environment variables;
* add retrieval-quality evaluation on a validation set;
* analyze feedback data to improve knowledge-base coverage;
* support `top-k` retrieval and reranking;
* add observability, tests, and full-stack containerization.
