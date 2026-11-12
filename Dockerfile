FROM python:3.11-alpine
RUN apk add --no-cache bash
RUN pip install --no-cache-dir watchdog
WORKDIR /app
COPY generate_strm.py .
ENTRYPOINT ["python3", "generate_strm.py"]
