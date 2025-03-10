FROM node:22.11
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npx tsc
EXPOSE 3000
CMD ["node", "dist/main.js"]

# FROM node:22.11
# WORKDIR /app
# COPY package*.json ./
# RUN npm install --legacy-peer-deps
# COPY . .
# EXPOSE 3000
# CMD ["node", "app.js"]


# FROM node:22.11
# WORKDIR /app
# COPY package*.json ./
# RUN npm install --legacy-peer-deps
# COPY . .

# EXPOSE 3000
# CMD ["node", "app.js"]
