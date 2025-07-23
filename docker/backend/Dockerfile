FROM node:20-alpine

WORKDIR /app

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S jbx -u 1001

# Copy package files
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Change ownership
RUN chown -R jbx:nodejs /app
USER jbx

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

CMD ["npm", "start"]
