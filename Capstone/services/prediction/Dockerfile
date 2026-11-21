FROM python:3.11-slim
WORKDIR /app
COPY services/prediction/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY shared ./shared
COPY services/prediction ./services/prediction
ENV PYTHONPATH=/app
EXPOSE 8003
# Prediction is a library consumed by the gateway service.
# This healthcheck validates the module imports correctly at build time.
CMD ["python", "-c", "from services.prediction.app.service import PredictionEngine; print('prediction module OK')"]
