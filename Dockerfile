FROM node:10

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY ./package.json .
RUN npm install --no-save
COPY ./ .
RUN npm run build

USER node
ENV NODE_ENV=production
CMD ["npm", "start"]
