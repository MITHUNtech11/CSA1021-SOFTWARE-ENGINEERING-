FROM python:3.11-slim
WORKDIR /app
COPY services/prediction/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY shared ./shared
COPY services/prediction ./services/prediction
ENV PYTHONPATH=/app
EXPOSE 8003
CMD ["python", "-m", "services.prediction.app.service"]
