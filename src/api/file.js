const Joi = require('@hapi/joi');
const dateFormat = require('dateformat');
const fs=require('fs');

exports.plugin = {
    name:    'file',
    version: '0.0.1',
    register: async (server) => {
        server.route({
            method: 'POST',
            path:   '/text',
            config: {
                async handler(req) {
                    return req.payload.text
                },
                description: 'Обзор всех категорий',
                tags:        ['api'],
                validate: {
                    payload: Joi.object({
                        text: Joi.string()
                    })
                }
            }
        });
        server.route({
            method: 'GET',
            path:   '/address',
            config: {
                async handler(req) {
                    return require('../../train/array-address.json').address[0]
                },
                description: 'Обзор всех категорий',
                tags:        ['api']
            }
        });
        server.route({
            method: 'DELETE',
            path:   '/address/{id}',
            config: {
                async handler(req) {
                    try {
                        const address=require('../../train/array-address.json').address;
                        let index=-1;
                        for (const i in address ){
                            if(address[i].index===req.params.id){
                                index=i;
                                break;
                            }
                        }
                        if(index>-1){
                            address.splice(index,1);
                        }
                        const fd = fs.openSync("train/array-address.json",'w');
                        fs.writeSync(fd, JSON.stringify({address:address}));
                        fs.closeSync(fd);
                        return {err:false,text:"Все заебись"}
                    }catch (e) {
                        console.log(e);
                        return {err:true,text:"Все хуево"}
                    }

                },
                description: 'Обзор всех категорий',
                tags:        ['api'],
                validate: {
                    params:Joi.object({
                        id:Joi.number()
                    })
                }
            }
        });
    }
};