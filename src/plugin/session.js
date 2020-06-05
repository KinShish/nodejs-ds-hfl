const register = async (server,configs)=> {
    try {
        return await server.register([{
                plugin: require('hapi-server-session'),
                options: {
                    cookie: {
                        isSecure: false
                    }
                }
            }
        ]);
    } catch (err) {
        console.log(`Error registering swagger plugin: ${err}`);
    }
};
module.exports={register};