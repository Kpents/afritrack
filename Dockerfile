FROM node:24-bookworm-slim AS verify
WORKDIR /build
COPY app ./app
COPY server ./server
COPY tests ./tests
RUN cd app && npm test

FROM node:24-bookworm-slim AS runtime
ENV NODE_ENV=production PORT=4173 AFRITRACK_DB=/data/afritrack.sqlite
WORKDIR /opt/afritrack
COPY --from=verify --chown=node:node /build/app ./app
COPY --from=verify --chown=node:node /build/server ./server
RUN mkdir /data && chown node:node /data
USER node
VOLUME ["/data"]
EXPOSE 4173
HEALTHCHECK --interval=30s --timeout=5s CMD node -e "fetch('http://127.0.0.1:4173/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "server/server.mjs"]
