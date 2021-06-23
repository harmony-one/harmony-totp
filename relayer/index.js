const { createRequest } = require('./src/relayer.js')
const server = require("./src/adapters/express");
const serverless = require("./src/adapters/serverless");

module.exports = {
    server: server.init(createRequest),
    gcpservice: serverless.initGcpService(createRequest),
    handler: serverless.initHandler(createRequest),
    handlerv2: serverless.initHandlerV2(createRequest)
  }
  