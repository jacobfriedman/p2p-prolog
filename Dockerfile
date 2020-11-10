FROM node:15 AS stage1
WORKDIR /app
RUN npm install -g peer-id

RUN peer-id > .identity-signaller.json
RUN peer-id > .identity-client.json

FROM scratch AS export

COPY --from=stage1 /app/.identity-signaller.json .
COPY --from=stage1 /app/.identity-client.json .