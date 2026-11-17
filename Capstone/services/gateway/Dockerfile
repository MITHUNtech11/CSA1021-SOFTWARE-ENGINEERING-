FROM python:3.11-slim
WORKDIR /app
COPY services/gateway/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY shared ./shared
COPY services/ingestion ./services/ingestion
COPY services/analytics ./services/analytics
COPY services/prediction ./services/prediction
COPY services/gateway ./services/gateway
COPY data ./data
ENV PYTHONPATH=/app
EXPOSE 8000
CMD ["uvicorn", "services.gateway.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
