FROM node:20-slim

# Install required dependencies for Chromium
RUN apt-get update && apt-get install -y \
    wget \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libx11-6 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libxss1 \
    libxshmfence1 \
    libnss3 \
    libnspr4 \
    libdrm2 \
    libgbm1 \
    libxkbcommon0 \
    xdg-utils \
    --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Create and use app directory
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies (must include puppeteer, not puppeteer-core)
RUN npm install

# Copy rest of project
COPY . .

EXPOSE 3000

# Start App
CMD ["npm", "start"]

