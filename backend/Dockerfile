# Use official Node.js image
FROM node:20

# Install Python3 and pip
RUN apt-get update && apt-get install -y python3 python3-pip

# Set working directory
WORKDIR /app

# Copy Node dependencies first for caching
COPY package*.json ./

# Install Node dependencies
RUN npm install

# Copy the rest of the backend files (including Python scripts)
COPY . .

# Install Python dependencies
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

# Expose the port your Node server listens on
EXPOSE 5122

# Start the Node server
CMD ["node", "index.js"]
