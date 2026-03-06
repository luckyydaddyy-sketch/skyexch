
const data = { "SEXYBCRT": { "LIVE": { "limitId": [120119, 120101, 120102] } }, "HOTROAD": {"LIVE": { "limitId": [100006, 100007] } }, "HORSEBOOK": {"LIVE": {"minorMinbet": 5,"minorMaxbet": 2500,"minorMaxBetSumPerHorse": 2500,"minbet": 5,"maxbet": 3000,"maxBetSumPerHorse": 3000}}}

const ObjectData = Object.keys(data).map((keys) => keys);
const platform = "SEXYBCRT";

console.log("ObjectData:: ", ObjectData);
if(ObjectData.includes(platform)){
    const ddddd = data[platform];

    console.log("ddddd : ", ddddd);
    const newObject = {}

    newObject[`${platform}`] = ddddd

    console.log("newObject: ", newObject);
    
}