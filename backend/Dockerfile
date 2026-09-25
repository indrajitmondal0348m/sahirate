# Production Dockerfile for SahiRate Backend API (Optimized for GCP Cloud Run / Cloud Console)
FROM python:3.11-slim

# Prevent Python from writing .pyc files and enable unbuffered streaming logs
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8080 \
    APP_HOME=/app

WORKDIR ${APP_HOME}

# Install essential system packages and security updates
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create a non-privileged user and group for security compliance
RUN groupadd -g 10001 appuser && \
    useradd -u 10001 -g appuser -d ${APP_HOME} -s /sbin/nologin appuser

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY app ./app

# Create data directory for local/volume SQLite storage and set proper ownership
RUN mkdir -p ${APP_HOME}/data && \
    chown -R appuser:appuser ${APP_HOME}

# Switch to non-root user
USER appuser

# Expose standard Cloud Run port
EXPOSE 8080

# Health check configuration against the backend /health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8080}/health || exit 1

# Start Uvicorn bound to 0.0.0.0 and dynamic Cloud Run $PORT
CMD exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080} --proxy-headers
