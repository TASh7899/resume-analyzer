# Use a slim Node image
FROM node:20-slim

# Install system dependencies required for Chromium
RUN apt-get update && apt-get install -y \
    wget \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    xdg-utils \
    --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (ensure puppeteer is installed, not puppeteer-core)
RUN npm install

# Copy app source
COPY . .

# Expose port (Render will detect automatically but this helps locally)
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
