const ms = require('ms');
const dns = require('dns/promises');
const { statusBedrock } = require("minecraft-server-util");
const { parseAddress } = require("../util");

module.exports=async function(req, res) {
    let { address } = req.params;
    let result = await parseAddress(address);
    if(!result.success) {
        res.statusCode = 400;
        return res.end(JSON.stringify({error: result.error}))
    }
    let cached = await global.redis.get(`bedrock:${result.data.host}-${result.data.port}`)
    if(cached) {
        res.end(cached);
        return global.redis.incr(`bedrock:${result.data.host}-${result.data.port}:hits`)
    }

    statusBedrock(result.data.port == 25565 ? result.data.host : result.data.ip, result.data.port,{enableSRV: true, timeout: 5000}).then(async response => {
        response = {
            online:true, 
            host: result.data.host, 
            ip:result.data.ip ?? (await dns.lookup(host).catch(e=>{}))?.address, 
            port: result.data.port, 
            retrived_at: Date.now(),
            expires_at: Date.now()+ms(process.env.JAVA_STATUS_CACHE),
            ...response}
        delete response.serverGUID;
        delete response.portIPv4;
        delete response.portIPv6;
        delete response.gameModeID
        delete response.srvRecord
        
        res.end(JSON.stringify(response))
        global.redis.pipeline()
            .set(`bedrock:${result.data.host}-${result.data.port}`, JSON.stringify(response), "EX", ms(process.env.JAVA_STATUS_CACHE)/1000)
            .incr(`bedrock:${result.data.host}-${result.data.port}:hits`)
            .exec();
    }).catch(err => {
        res.writeHead(500)
        console.log(`Error while fetching Bedrock Status for server (${result.data.host}:${result.data.port}): \n${err.message}`)
        if(err.message.includes("getaddrinfo ENOTFOUND") || err.message.includes("connect ECONNREFUSED") || err.message.includes("Server is offline or unreachable")){
            let response = {
                online: false, 
                host: result.data.host,
                ip: result.data.ip,
                port: result.data.port, 
                retrived_at: Date.now(), 
                expires_at: Date.now()+ms(process.env.JAVA_STATUS_CACHE)
            }
            res.end(JSON.stringify(response))
            return global.redis.set(`bedrock:${result.data.host}-${result.data.port}`, JSON.stringify(response), "EX", ms(process.env.JAVA_STATUS_CACHE)/1000)
        }
        return res.end(JSON.stringify({error: err.message}))
    })
}