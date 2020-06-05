const nconf =require("nconf");
const path =require("path");

const configs = new nconf.Provider({
    env: true,
    argv: true,
    store: {
        type: "file",
        file: path.join(__dirname, `./config.${process.env.NODE_ENV || "dev"}.json`)
    }
});

const getDatabaseConfig=()=> {
    return configs.get("db");
};
const getServerConfigs=()=> {
    return configs.get("server");
};
const getSwaggerConfigs=()=> {
    return configs.get("swagger");
};
module.exports= {getDatabaseConfig,getServerConfigs,getSwaggerConfigs};