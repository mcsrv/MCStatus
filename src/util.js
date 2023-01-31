const dns = require('dns/promises')
async function parseAddress(address){
    let split = address.split(":");
    if(split.length < 1) return {success: false, error: "Invalid address."}
    if(split.length < 2) {
        if(new RegExp(/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/).test(split[0])) 
            return {success: true, data: {host: split[0], port: 25565}}
        if(new RegExp(/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/).test(split[0]))
            return {success: true, data: {host: split[0], port: 25565}}
        return {success: false, error: "Invalid address."}
    }
    //here we have 2 pieces which means we have ip/domain and a port
    if(!validatePort(split[1])) return {success: false, error: "Invalid port."}
    if(new RegExp(/^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/).test(split[0])) 
        return {success: true, data: {host: split[0], port: parseInt(split[1])}}
    if(new RegExp(/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/).test(split[0]))
        return {success: true, data: {host: split[0], ip: (await dns.lookup(split[0]).catch(e=>{})).address, port: parseInt(split[1])}}
    return {success: false, error: "Invalid address."}
}

function validatePort(port) {
    if(port.length > 5) return false
    if(port.startsWith("0")) return false;
    if(port === "0") return false;
    if(isNaN(parseInt(port))) return false;
    if(parseInt(port) > 65535) return false;
    return true;
}

module.exports={
    parseAddress
}