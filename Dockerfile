FROM node:12
WORKDIR /usr/SkuldMeme

COPY package.json package-lock.json /usr/src/app/
COPY . .

RUN npm install

CMD ["npm", "start"]