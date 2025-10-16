# Use Python image (make sure it has python3)
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy your backend files
COPY . .

# Create a virtual environment
RUN python3 -m venv venv

# Activate venv and install Python dependencies
RUN ./venv/bin/pip install --upgrade pip
RUN ./venv/bin/pip install -r requirements.txt

# Make sure Node dependencies are installed
RUN npm install

# Expose Node server port
EXPOSE 5122

# Start your Node server
CMD ["node", "server.js"]
