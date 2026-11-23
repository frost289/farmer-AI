FROM python:3.12-slim
WORKDIR /app
COPY ai-services/speech/requirements.txt ./requirements.txt
COPY .docker-wheelhouse /wheels
RUN pip install --no-cache-dir --no-index --find-links=/wheels -r requirements.txt
COPY ai-services/speech/app ./app
EXPOSE 8003
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8003"]
