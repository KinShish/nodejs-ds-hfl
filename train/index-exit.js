const fs=require('fs');
const readline=require('readline');
let arrayFinish=require('./array-finish.json');
const natural = require('natural');
const cliProgress = require('cli-progress');
const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
const streetText=/(мкр )|(мкр\.)|(yлица )|(проезд )|(ул\.)|(проспект )|(переулок )|(пер\.)|(пр\.)|(бульвар )|(проулок )|(аллея )|(площадь )|(шоссе )|(стрит )|(магистраль )|(дорога )/i;
const regionText=/(регион)|(край)|(область)|(обл\.)|(рег\.)|(республика)|(респ\.)/i;
const cityText=/(д\.)|(рп )|(дп )|(днп )|(город )|(городок )|(поселок )|(пос\.)|(посёлок )|(деревня )|(селение )|(поселение )|(пгт )|(хутор )|(х\.)|(хут\.)|(село )|(с\.)|(пгт\.)|(г\.)/i;
const houseText=/(д\.)|(дом )|(дом\.)|(здание )|(строение )|(стр\.)|(коттедж )/i;
regExpRegion=/^[а-яё."'\-\s]+$/i;
regExpCity=/^[0-9а-яё."'\-\s]+$/i;
regExpStreet=/^[0-9а-яё."'\-\s]+$/i;
regExpHouse=/^[0-9а-яё."'\-\s]+$/i;
regExpRoom=/^[0-9а-яё."'\-\s]+$/i;

const array={address:[]};
let count=0;
const lineReader = readline.createInterface({
    input: fs.createReadStream('./good/first.csv')
});

lineReader.on('line', function (line) {
    count++;
    const address = line.split(';')[1].replace(/\"/g);
    array.address.push({line:line,array:address.split(',')});
    bar1.start(array.address.length, 0);
});

lineReader.on('close', ()=>{
    let exitLine="";let i=0;
    array.address.forEach(str=>{
        i++;
        let newText='',house="";
        let regiom={max:0,text:''},city={max:0,text:''},street={max:0,text:''};
        for(let i in str.array){
            if((i!=0)&&(/(\s\d+)|(дом\s\d+)|(д\.\d+)/i.test(str.array[i]))){
                house=str.array[i].match(/(\s\d+)|(дом\s\d+)|(д\.\d+)|(д\.\s\d+)/i)[0];
                break;
            }
        }
        const similarityGlogal=(index,text,sd)=>{
            const similarity = arrayFinish[index].filter(function (e) {
                return e.substr(0, 3)=== text.substr(0, 3);
            });
            similarity.forEach(a=>{
                if (natural.JaroWinklerDistance(text, a) > sd.max) {
                    sd.max = natural.JaroWinklerDistance(text, a);
                    sd.text = a
                }
            })
        }
        str.array.forEach(text=>{
            if((regExpRegion.test(text))&&(!(/^[0-9\s]+$/i.test(text)))&&(((!streetText.test(text))&&(!cityText.test(text))&&(!houseText.test(text)))||regionText.test(text))) {
                similarityGlogal('region',text,regiom)
            }
            if((regExpCity.test(text))&&(!(/^[0-9\s]+$/i.test(text)))&&(((!streetText.test(text))&&(!regionText.test(text))&&(!houseText.test(text)))||cityText.test(text))) {
                similarityGlogal('city',text,city)
            }
            if((regExpStreet.test(text))&&(!(/^[0-9\s]+$/i.test(text)))&&(((!cityText.test(text))&&(!regionText.test(text))&&(!houseText.test(text)))||streetText.test(text))) {
                similarityGlogal('street',text,street)
            }
        })
        exitLine+=str.line+';0 '+regiom.text+', '+city.text+', '+street.text+', '+house+'\n';
        console.log(i,array.address.length);
    })
    const fd = fs.openSync("../result_alna.csv",'w');
    fs.writeSync(fd, exitLine);
    fs.closeSync(fd);
    bar1.stop();
    console.log('Все заебись')
});