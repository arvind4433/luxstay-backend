const os = require('os');
const { IPinfoWrapper } = require("node-ipinfo");


const getLocalIP = () => {
  const interfaces = os.networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    for (const exact of interfaces[name]) {
      //console.log(exact);
      if (exact.family === "IPv4" && !exact.internal) {
        return exact.address;
      }
    }

  }
}
const getLocalIPInfo = async () => {
  const ip = getLocalIP();
  try {
    if (!process.env.IPINFO_TOKEN) {
      return { ip: ip || "unknown", countryCode: "N/A", region: "N/A", city: "N/A" };
    }
    const ipinfo = new IPinfoWrapper(process.env.IPINFO_TOKEN);
    const info = await ipinfo.lookupIp(ip || "");
    return info;
  } catch (error) {
    console.error('Error fetching IP information:', error.message);
    return { ip: ip || "unknown", countryCode: "N/A", region: "N/A", city: "N/A" };
  }
}

module.exports = { getLocalIPInfo };