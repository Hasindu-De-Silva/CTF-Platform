FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
EXPOSE 8081
ENV PORT=8081
USER node
CMD ["node", "server.js"]
