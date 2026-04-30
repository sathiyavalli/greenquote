FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js app
RUN npm run build

# Expose port
EXPOSE 3000

# Start app
CMD ["npm", "start"]
