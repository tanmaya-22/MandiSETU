FROM python:3.11-slim

WORKDIR /app

# System deps for asyncpg + Pillow + Prophet
RUN apt-get update && apt-get install -y \
    gcc libpq-dev curl build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p uploads app/ml/datasets

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
