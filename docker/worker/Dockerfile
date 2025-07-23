FROM mcr.microsoft.com/playwright:v1.40.0-focal

WORKDIR /app

# Install Node.js dependencies
COPY package*.json ./
RUN npm ci --only=production

# Install Playwright browsers
RUN npx playwright install chromium

# Copy source code
COPY . .

# Create logs directory
RUN mkdir -p /app/logs

# Health check
HEALTHCHECK --interval=60s --timeout=30s --start-period=10s --retries=3 \
  CMD ps aux | grep -v grep | grep node || exit 1

CMD ["npm", "start"]
