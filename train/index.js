const fs=require('fs');
const readline=require('readline');

const array={address:[]};
let count=0;
const lineReader = readline.createInterface({
    input: fs.createReadStream('./good/first.csv')
});

lineReader.on('line', function (line) {
    count++;
    const address = line.split(';')[1].replace(/\"/);
    array.address.push({index:count,array:address.split(',')});
});
lineReader.on('close', ()=>{
    console.log(JSON.stringify(array));
    const fd = fs.openSync("array-address.json",'w');
    fs.writeSync(fd, JSON.stringify(array));
    fs.closeSync(fd);
});