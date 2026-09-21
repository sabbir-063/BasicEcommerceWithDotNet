FROM node:24-alpine AS build
WORKDIR /app
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
COPY package*.json ./
RUN npm ci
COPY . .
RUN test -n "$VITE_API_BASE_URL" && npm run build

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=10000
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
EXPOSE 10000
CMD ["sh", "-c", "./node_modules/.bin/serve -s dist -l tcp://0.0.0.0:${PORT}"]
