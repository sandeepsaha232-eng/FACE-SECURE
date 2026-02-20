FROM python:3.10-slim

# Install system dependencies for OpenCV/MediaPipe
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements first for Docker layer caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir torch==2.1.2 torchvision==0.16.2 --index-url https://download.pytorch.org/whl/cpu \
    && pip install --no-cache-dir -r requirements.txt \
    && pip uninstall -y opencv-python 2>/dev/null; pip install --no-cache-dir opencv-python-headless

# Copy application code
COPY . .

# Download MediaPipe models
RUN python scripts/download_models.py

# Expose port (Railway sets PORT env var)
EXPOSE 8000

# Start the service
CMD ["python", "main.py"]
