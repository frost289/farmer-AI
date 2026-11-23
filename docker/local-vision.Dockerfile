FROM python:3.12-slim
WORKDIR /app
COPY ai-services/vision/requirements.txt ./requirements.txt
COPY .docker-wheelhouse /wheels
RUN pip install --no-cache-dir --no-index --find-links=/wheels -r requirements.txt
COPY ai-services/vision/app ./app
EXPOSE 8002
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8002"]
