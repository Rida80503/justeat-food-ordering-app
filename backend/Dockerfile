# Build stage
FROM python:3.12-slim AS builder

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Runtime stage
FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    APP_ENV=production \
    APP_HOST=0.0.0.0 \
    APP_PORT=8000 \
    APP_RELOAD=false \
    APP_WORKERS=2

WORKDIR /app

COPY --from=builder /install /usr/local
COPY . .

RUN useradd --create-home --uid 1000 appuser && \
    chown -R appuser:appuser /app

USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health', timeout=5)"

CMD ["sh", "-c", "alembic upgrade head && python run.py"]
