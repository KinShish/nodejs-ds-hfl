const Joi = require('@hapi/joi');
const dateFormat = require('dateformat');
const cliProgress = require('cli-progress');
const fs=require('fs');
const natural = require('natural');
let arrayFinish=require('../../train/array-finish.json');
const streetText=/(мкр )|(мкр\.)|(yлица )|(проезд )|(ул\.)|(проспект )|(переулок )|(пер\.)|(пр\.)|(бульвар )|(проулок )|(аллея )|(площадь )|(шоссе )|(стрит )|(магистраль )|(дорога )/i;
const regionText=/(регион)|(край)|(область)|(обл\.)|(рег\.)|(республика)|(респ\.)/i;
const cityText=/(д\.)|(рп )|(дп )|(днп )|(город )|(городок )|(поселок )|(пос\.)|(посёлок )|(деревня )|(селение )|(поселение )|(пгт )|(хутор )|(х\.)|(хут\.)|(село )|(с\.)|(пгт\.)|(г\.)/i;
const houseText=/(д\.)|(дом )|(дом\.)|(здание )|(строение )|(стр\.)|(коттедж )/i;
regExpRegion=/^[а-яё."'\-\s]+$/i;
regExpCity=/^[0-9а-яё."'\-\s]+$/i;
regExpStreet=/^[0-9а-яё."'\-\s]+$/i;
regExpHouse=/^[0-9а-яё."'\-\s]+$/i;
regExpRoom=/^[0-9а-яё."'\-\s]+$/i;
const getStatus=(text)=>{
    const status={country:0,region:0,city:0,street:0,house:0,room:0};
    const findMax=(index)=>{
        let max=status[index]?status[index]:0;
        const similarity = arrayFinish[index].filter(function (e) {
            return e.substr(0, 3)=== text.substr(0, 3);
        });
        similarity.forEach(a=>{
            if (natural.JaroWinklerDistance(text, a) > max) {
                max = natural.JaroWinklerDistance(text, a);
            }
        })
        status[index]=max;
    }
    findMax('country');
    if((regExpRegion.test(text))&&(!(/^[0-9\s]+$/i.test(text)))&&(((!streetText.test(text))&&(!cityText.test(text))&&(!houseText.test(text)))||regionText.test(text))){
        findMax('region');
    }
    if((regExpCity.test(text))&&(!(/^[0-9\s]+$/i.test(text)))&&(((!streetText.test(text))&&(!regionText.test(text))&&(!houseText.test(text)))||cityText.test(text))){
        findMax('city');
    }
    if((regExpStreet.test(text))&&(!(/^[0-9\s]+$/i.test(text)))&&(((!cityText.test(text))&&(!regionText.test(text))&&(!houseText.test(text)))||streetText.test(text))){
        findMax('street');
    }
    if((regExpHouse.test(text))&&(((!cityText.test(text))&&(!regionText.test(text))&&(!streetText.test(text)))||houseText.test(text))){
        findMax('house');
    }
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
                    try {
                        const address=require('../../train/array-address.json').address[0];
                        console.log(address)
                        const array=[];

                        address.array.forEach(text=>{
                            console.log(text)
                            array.push({text:text,status:getStatus(text)})
                            console.log(getStatus(text));
                        })
                        return {index:address.index,text:address.array.join(','),array:array}
                    }catch (e) {
                        console.log(e)
                    }

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
        server.route({
            method: 'POST',
            path:   '/address',
            config: {
                async handler(req) {
                    const text=req.payload.text,type=req.payload.type;
                    try {
                        arrayFinish[type].push(text);
                        const fd = fs.openSync("train/array-finish.json",'w');
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
                        const arrayAddress=address.split(',').length>0?address.split(','):[];
                        arrayAddress.forEach(text=>{
                            const status=getStatus(text)
                            let maxStatus={type:null,count:0}
                            for(let type in status){
                                if(status[type]>maxStatus.count){
                                    maxStatus.type=type;
                                    maxStatus.count=status[type];
                                }
                            }
                            if((maxStatus.type==='city')||(maxStatus.type==='street')||(maxStatus.type==='region')||(maxStatus.type==='house')){
                                if(maxStatus.count<=0.90){
                                    count++;
                                    array.address.push({index:count,array:a});
                                }
                                if((maxStatus.count>0.90)&&(maxStatus.count!==1)){
                                    arrayFinish[maxStatus.type].push(text);
                                    const fd = fs.openSync("train/array-finish.json",'w');
                                    fs.writeSync(fd, JSON.stringify(arrayFinish));
                                    fs.closeSync(fd);
                                }
                            }
                        })
                        bar1.update(i);
                    })
                    try {
                        const fd = fs.openSync("train/array-address.json",'w');
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
