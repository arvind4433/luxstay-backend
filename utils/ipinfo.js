const os = require('os');
const { IPinfoWrapper } = require("node-ipinfo");


const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const exact of interfaces[name]) {
        //console.log(exact);
       if(exact.family === "IPv4" && !exact.internal){
         return exact.address;
       }
    }

  }
}
const getLocalIPInfo = async () => {
  const ip = getLocalIP();
   try {
    const ipinfo = new IPinfoWrapper(process.env.IPINFO_TOKEN);
        const info = await ipinfo.lookupIp("49.156.85.26");
     //console.log('IP Information:', info.countryCode, info.region, info.city);
     return info;
   } catch (error) {
     console.error('Error fetching IP information:', error.message);
   }
}

module.exports = {getLocalIPInfo };