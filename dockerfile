FROM node:alpine AS development

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install  --legacy-peer-deps

COPY . .

RUN npm run build

FROM node:alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}


#Fixed docker file

WORKDIR /usr/src/app

COPY package*.json ./


#// deploy
RUN npm install --only=prod   --legacy-peer-deps



COPY . .

COPY --from=development /usr/src/app/dist ./dist

CMD ["node", "dist/main" ,"--port", "3000"]