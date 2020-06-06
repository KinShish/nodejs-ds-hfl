const Joi = require('@hapi/joi');
const dateFormat = require('dateformat');
const cliProgress = require('cli-progress');
const fs=require('fs');
const natural = require('natural');
let arrayFinish=require('../../train/array-finish.json');
regExpRegion=/dfgdfg/;regExpRegionNo=/dfgdfg/;
regExpCity=/dfgdfg/;regExpCityNo=/dfgdfg/;
regExpStreet=/dfgdfg/;regExpStreetNo=/dfgdfg/;
regExpCity=/dfgdfg/;regExpCityNo=/dfgdfg/;
regExpHouse=/dfgdfg/;regExpHouseNo=/dfgdfg/;
regExpRoom=/dfgdfg/;regExpRoomNo=/dfgdfg/;
const getStatus=(text)=>{
    const status={};
    const findMax=(index)=>{
        let max=status[index]?status[index]:0;
        arrayFinish[index].forEach(a=>{
            if((/^[а-яА-Я.\-\s]+$/.test(text))||((index==='city')&&(!/^[0-9\s]+$/.test(text))&&(/^[а-яА-Я0-9.\-\s]+$/.test(text)))||((index==='street')&&(!/^[0-9\s]+$/.test(text))&&(/^[а-яА-Я0-9.\-\s]+$/.test(text)))||((index==='house')&&(/^[а-яА-Я0-9.\-\s]+$/.test(text)))||((index==='room')&&(/^[а-яА-Я0-9.\-\s]+$/.test(text)))) {
                if (natural.JaroWinklerDistance(text, a) > max) {
                    max = natural.JaroWinklerDistance(text, a);
                }
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
    return status;
}
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
                        array.push({text:text,status:getStatus(text)})
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
                        const fd = fs.openSync("../train/array-address.json",'w');
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
        server.route({
            method: 'POST',
            path:   '/address',
            config: {
                async handler(req) {
                    const text=req.payload.text,type=req.payload.type;
                    try {
                        arrayFinish[type].push(text);
                        const fd = fs.openSync("../train/array-finish.json",'w');
                        fs.writeSync(fd, JSON.stringify(arrayFinish));
                        fs.closeSync(fd);
                        return {err:false, text:"Все заебись"}
                    }catch (e) {
                        console.log(e)
                        return {err:true, text:"Все хуево"}
                    }
                },
                description: 'Обзор всех категорий',
                tags:        ['api'],
                validate: {
                    payload:Joi.object({
                        text:Joi.string(),
                        type:Joi.string()
                    })
                }
            }
        });
        server.route({
            method: 'POST',
            path:   '/address/auto',
            config: {
                async handler(req) {
                    const array={address:[]};
                    let count=0;
                    const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
                    const string=req.payload.file.split('\n');
                    let i=0;
                    bar1.start(string.length, 0);
                    string.forEach(a=>{
                        i++;
                        const address = a.length>10?a.split(';')[1].replace(/\"/):',';
                        const arrayAddress=address.split(',');
                        arrayAddress.forEach(text=>{
                            const status=getStatus(text)
                            let maxStatus={type:null,count:0}
                            for(let type in status){
                                if(status[type]>maxStatus.count){
                                    maxStatus.type=type;
                                    maxStatus.count=status[type];
                                }
                            }
                            if((maxStatus.type==='city')||(maxStatus.type==='street')||(maxStatus.type==='region')){
                                if(maxStatus.count<=0.85){
                                    count++;
                                    array.address.push({index:count,array:a});
                                }
                                if((maxStatus.count>0.85)&&(maxStatus.count!==1)){
                                    arrayFinish[maxStatus.type].push(text);
                                    const fd = fs.openSync("../train/array-finish.json",'w');
                                    fs.writeSync(fd, JSON.stringify(arrayFinish));
                                    fs.closeSync(fd);
                                }
                            }
                        })
                        bar1.update(i);
                    })
                    try {
                        const fd = fs.openSync("../train/array-address.json",'w');
                        fs.writeSync(fd, JSON.stringify(array));
                        fs.closeSync(fd);
                        bar1.stop();
                        console.log('Все заебись')
                    }catch (e) {
                        console.log(e)
                    }

                    return {text:'Все заебись'}
                },
                description: 'Обзор всех категорий',
                tags:        ['api'],
                payload: {
                    maxBytes: 2071520000,
                    output: 'data',
                    multipart: true,
                    parse: true,
                    allow: ['multipart/form-data','application/csp-report','application/json','application/octet-stream']
                },
                validate: {
                    payload:Joi.object({
                        file: Joi.any().required(),
                    })
                }
            }
        });
    }
};
