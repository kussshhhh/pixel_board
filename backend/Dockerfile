FROM node:21.7.1

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT = 8080

EXPOSE 8080

CMD ["npm", "start"] ;
