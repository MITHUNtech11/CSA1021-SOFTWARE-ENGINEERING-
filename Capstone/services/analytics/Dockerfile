FROM python:3.11-slim
WORKDIR /app
COPY services/analytics/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY shared ./shared
COPY services/analytics ./services/analytics
ENV PYTHONPATH=/app
EXPOSE 8002
# Analytics is a library consumed by the gateway service.
# This healthcheck validates the module imports correctly at build time.
CMD ["python", "-c", "from services.analytics.app.engine import AnalyticsEngine; print('analytics module OK')"]
