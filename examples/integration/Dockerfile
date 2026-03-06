FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

# env-lock.json and .env.enc are committed to the repo and copied into the image.
# The password is provided at runtime — secrets are never baked into the image.
#
# Run with:
#   docker run -e ENV_LOCK_PASSWORD=1234 my-app

CMD ["env-lock", "run", "--", "node", "app.js"]
