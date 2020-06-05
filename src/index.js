const Server = require("./server");
const Configs = require("./config");

console.log(`Running environment ${process.env.NODE_ENV || "dev"}`);

process.on("uncaughtException", (err) => {
    console.error(`uncaughtException ${err.message}`);
});

process.on("unhandledRejection", (reason) => {
    console.error(`unhandledRejection ${reason}`);
});

const start = async (config) => {
    try {
        const server = await Server.init(config);
        await server.start();
        console.log("Server running at:", server.info.uri+'/documentation');
    } catch (err) {
        console.error("Error starting server: ", err.message);
        throw err;
    }
};

const db = Configs.getDatabaseConfig();
const server = Configs.getServerConfigs();
const swagger = Configs.getSwaggerConfigs();

start({server,swagger,db}).then();