FROM python:3.10-slim

RUN pip install uv

RUN uv --version

WORKDIR /app

COPY requirements.txt .

RUN uv pip install -r requirements.txt --system

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]