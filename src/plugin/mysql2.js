const configDB = require('../config/db.js');
const register = async (server,configs)=> {
    try {
        return await server.register([{
                plugin: require('hapi-mysql2'),
                options: {
                    settings: configDB.options,
                    decorate: true
                }
            }
        ]);
    } catch (err) {
        console.log(`Error registering swagger plugin: ${err}`);
    }
};
module.exports={register};