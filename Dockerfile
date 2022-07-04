
FROM node:lts
WORKDIR /code
COPY yarn.lock package.json /code/
RUN yarn 

COPY . .
ENV NODE_ENV=production
RUN yarn next build
CMD yarn next start