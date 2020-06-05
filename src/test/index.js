const assert = require('chai').assert;
const Server = require('../server');
const Configs = require("../config");

console.log(`Running environment ${process.env.NODE_ENV || "test"}`);
const dbConfig = Configs.getDatabaseConfig();
const serverConfig = Configs.getServerConfigs();
const swaggerConfig = Configs.getSwaggerConfigs();

describe('Server Testing', ()=>{
    it('should validate if server is running', async()=> {
        const server=await Server.init({server:serverConfig,swagger:swaggerConfig,db:dbConfig});
        return server.inject({
            method: 'GET',
            url: '/car/1582929050/1583929050'
        }).then((res)=>{
            assert.deepEqual(res.result.err, false);
        });
    });
    it('should validate if server is running 2', async()=> {
        const server=await Server.init({server:serverConfig,swagger:swaggerConfig,db:dbConfig});
        return server.inject({
            method: 'GET',
            url: '/driver/811/1582929050/1583929050'
        }).then((res)=>{
            assert.deepEqual(res.result.err, false);
        });
    });
});