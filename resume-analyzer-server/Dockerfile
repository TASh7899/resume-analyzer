FROM ghcr.io/puppeteer/puppeteer:latest

# Switch to root for installation
USER root

# Create working directory inside container
WORKDIR /usr/src/app

# Copy dependency files
COPY package*.json ./

# Install dependencies (must include puppeteer, not puppeteer-core)
RUN npm install

# Copy all server files
COPY . .

# Fix permission so non-root user can run safely
RUN chown -R pptruser:pptruser /usr/src/app

# Switch back to non-root (safer)
USER pptruser

# Expose port for Render
EXPOSE 3000

# Run your app
CMD ["node", "index.js"]

