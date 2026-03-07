FROM node:20-alpine
WORKDIR /app
COPY app/package*.json ./
RUN npm ci
COPY app/ .
RUN npm run build
EXPOSE 3000
ENV PORT=3000
CMD ["npx", "next", "start", "-p", "3000"]
