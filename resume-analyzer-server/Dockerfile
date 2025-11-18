FROM node:20-slim

# Install all dependencies Chromium needs
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
    libxshmfence1 \
    libnss3 \
    libnspr4 \
    libdrm2 \
    libgbm1 \
    xdg-utils \
    --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install   # puppeteer must be a dependency (not puppeteer-core)

COPY . .

EXPOSE 3000
CMD ["npm", "start"]

