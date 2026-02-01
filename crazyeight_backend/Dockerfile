# Use official Node.js LTS image
FROM node:20-alpine

# Create and set working directory
WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy TypeScript source files
COPY . .

# Install dev dependencies for building
RUN npm ci --only=development

# Build TypeScript to JavaScript
RUN npm run dev

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

# Expose port (adjust based on your server.ts)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); const options = {host: 'localhost', port: 3000, path: '/health', timeout: 2000}; const request = http.request(options, (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }); request.on('error', () => { process.exit(1); }); request.end();"

# Start the application
CMD ["node", "./dist/server.js"]