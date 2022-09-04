FROM node:12.18.4-buster-slim

LABEL maintainer="buildmaster@rocket.chat"

ENV RC_VERSION 3.11.1-fixes

WORKDIR /app

# dependencies
RUN groupadd -g 65533 -r rocketchat \
    && useradd -u 65533 -r -g rocketchat rocketchat \
    && mkdir -p /app/uploads \
    && chown rocketchat:rocketchat /app/uploads

# --chown requires Docker 17.12 and works only on Linux
ADD --chown=rocketchat:rocketchat . /app

ADD rocketchat-3.11.1.tar.gz .

RUN set -x \
 && cd /app/bundle/programs/server \
 && npm install --production \
 && npm cache clear --force \
 && chown -R rocketchat:rocketchat /app
 
RUN set -x \
 && apt-get update && apt-get install -y tcpdump --no-install-recommends \
 && rm -rf /var/lib/apt/lists/* \
 && chmod +s /usr/sbin/tcpdump

USER rocketchat

VOLUME /app/uploads

WORKDIR /app/bundle

# needs a mongoinstance - defaults to container linking with alias 'mongo'
ENV DEPLOY_METHOD=docker \
    NODE_ENV=production \
    MONGO_URL=mongodb://mongo:27017/rocketchat-new \
    HOME=/tmp \
    PORT=3000 \
    ROOT_URL=http://localhost:3000 \
    Accounts_AvatarStorePath=/app/uploads

EXPOSE 3000

CMD ["node", "main.js"]
