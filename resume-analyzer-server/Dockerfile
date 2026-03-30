# 1. Use a lightweight Debian-based Node image
FROM node:20-slim

# 2. Install Chromium and required fonts manually (100% explicit)
RUN apt-get update \
    && apt-get install -y chromium \
    fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# 3. Tell Puppeteer to SKIP downloading its own Chrome and use the one we just installed
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# 4. Standard app setup
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

# Expose your Render port
EXPOSE 3000

# Start the app
CMD ["node", "index.js"]
