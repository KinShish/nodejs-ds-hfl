const Hapi = require('@hapi/hapi');
const ip = require("ip");

const init = async (configs) => {
    const host = ip.address() || configs.server.host;
    const port = process.env.PORT || configs.server.port;
    const server = new Hapi.Server({
        debug: { request: ['error'] },
        host:host,
        port: port,
        routes: {
            cors: {
                origin: ["*"]
            }
        }
    });
    for(const plugin of configs.server.plugins){
        await require('./plugin/'+plugin).register(server,configs);
    }
    for(const module of configs.server.modules){
        await server.register(require('./api/'+module));
    }
    return server;
};
module.exports={init};