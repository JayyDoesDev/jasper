FROM node:20

WORKDIR /app

# Copy source code
COPY ./ ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Build TypeScript
RUN yarn build

# Start the bot
CMD ["yarn", "start"]
