FROM node:17

VOLUME ["/var/newsstand/users/", "/var/log/newsstand"]

WORKDIR /usr/newsstand/
COPY ./src/main/node/package*.json ./
RUN npm install

COPY . .


EXPOSE 8081
ENV PORT=8081

ENV NODE_SHOW_HOST=localhost
ENV NODE_SHOW_PORT=8080
ENV USER_BASE=/usr/newsstand/src/resources/users/

ENTRYPOINT ["nodejs", "/usr/newsstand/src/main/node/feed.js"]