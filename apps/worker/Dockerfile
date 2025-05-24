FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build TypeScript
RUN yarn build

# Install wrangler globally
RUN yarn global add wrangler

# Expose miniflare port
EXPOSE 8787

# Start in development mode using miniflare
CMD ["wrangler", "dev", "--local", "--port", "8787"]
