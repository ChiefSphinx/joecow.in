FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY src/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY src/main.py .

# Expose port
EXPOSE 5001

# Run the application
CMD ["python", "main.py"] 