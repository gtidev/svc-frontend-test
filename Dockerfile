FROM node:14.16.1-alpine
WORKDIR /app
ADD . /app
RUN npm install
RUN npm install pm2 -g
CMD pm2 start index.js && tail -f /dev/null
EXPOSE 5000


#RUN mkdir -p /home/node/app/v1/core/node_modules && chown -R node:node /home/node/app
#WORKDIR /home/node/app/v1/core
#COPY package*.json ./
#USER node
#RUN npm install
#COPY --chown=node:node . .
#EXPOSE 3000
#CMD [ "npm", "run", "start", "index.js" ]
