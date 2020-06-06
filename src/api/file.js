const Joi = require('@hapi/joi');
const dateFormat = require('dateformat');
const fs=require('fs');
const natural = require('natural');
const arrayFinish=require('../../train/array-finish.json');
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
                    const address=await require('../../train/array-address.json').address[0];
                    const array=[];
                    address.array.forEach(text=>{
                        const status={};
                        const findMax=(index)=>{
                            let max=status[index]?status[index]:0;
                            arrayFinish[index].forEach(a=>{
                                if(natural.JaroWinklerDistance(text, a)>max){
                                    max=natural.JaroWinklerDistance(text, a);
                                }
                            })
                            status[index]=max;
                        }
                        findMax('country');
                        findMax('region');
                        findMax('city');
                        findMax('street');
                        findMax('house');
                        findMax('room');
                        array.push({text:text,status:status})
                    })
                    return {index:address.index,text:address.array.join(','),array:array}
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
