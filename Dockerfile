FROM node:12

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN npm install -g http-server

RUN echo "deb http://archive.ubuntu.com/ubuntu precise main universe" > /etc/apt/sources.list

RUN apt-get update -y && \
  apt-get upgrade -y --force-yes && \
  apt-get install -y --force-yes supervisor

COPY . .

COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

ENV shopifyToken='6834c83442f0e36c70897f016e5b7db4'

EXPOSE 8000

EXPOSE 8080

# CMD  ["/usr/bin/supervisord"]
CMD ["/usr/bin/supervisord"]

