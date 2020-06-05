
const register = async (server,configs)=> {
    try {
        return await server.register([{
                plugin: require('inject-then')
            }
        ]);
    } catch (err) {
        console.log(`Error registering swagger plugin: ${err}`);
    }
};
module.exports={register};