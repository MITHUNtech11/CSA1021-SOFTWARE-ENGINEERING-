FROM node:22-bookworm-slim AS node-runtime

FROM python:3.11-slim

ENV PYTHONPATH=/app PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1 XDG_CACHE_HOME=/tmp
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends ffmpeg ca-certificates \
    && rm -rf /var/lib/apt/lists/*
COPY services/gateway/requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip pip install --timeout 60 --retries 5 -r requirements.txt
COPY shared ./shared
COPY services ./services
COPY data ./data

COPY --from=node-runtime /usr/local/bin/node /usr/local/bin/node

USER 10001:10001
EXPOSE 8000
CMD ["uvicorn", "services.gateway.app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1", "--ws-max-size", "4096"]
