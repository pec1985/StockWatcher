FROM node:18-alpine


# Create app directory
WORKDIR /app

COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

EXPOSE 5432

CMD ["npm", "start"]
