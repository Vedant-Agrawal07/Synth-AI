# Use Node as base image
FROM node:20-bullseye

# Install Python and pip
RUN apt-get update && \
    apt-get install -y python3 python3-pip python3-venv && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy Node dependencies first
COPY package*.json ./

# Install Node dependencies
RUN npm install

# Copy Python requirements
COPY requirements.txt ./

# Create Python virtual environment
RUN python3 -m venv venv
RUN ./venv/bin/pip install --upgrade pip
RUN ./venv/bin/pip install -r requirements.txt

# Copy the rest of the backend code
COPY . .

# Expose Node server port
EXPOSE 5122

# Start Node server
CMD ["node", "server.js"]
