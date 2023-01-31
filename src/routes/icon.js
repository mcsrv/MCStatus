const ms = require('ms')
const fs = require('fs');
const path = require('path');
const { status } = require("minecraft-server-util");
const { parseAddress } = require("../util");
module.exports=async function(req, res){
    let { address } = req.params;
    let result = await parseAddress(address);
    if(!result.success) {
        res.statusCode = 400;
        return res.end(JSON.stringify({error: result.error}))
    }
    let cached = await global.redis.get(`icon:${result.data.host}-${result.data.port}`)
    if(cached) return res.end(Buffer.from(cached.slice(22, cached.length), 'base64'));

    status(result.data.port == 25565 ? result.data.host : result.data.ip, result.data.port,{timeout: 5000}).then(async response => {
        res.writeHead(200, { "content-type": 'image/png' })
        let iconBase64 = response.favicon.slice(22, response.favicon.length)
        res.end(Buffer.from(iconBase64, 'base64'))
        global.redis.set(`icon:${result.data.host}-${result.data.port}`, response.favicon, "EX", ms(process.env.ICON_CACHE)/1000)
    }).catch(async err => {
        console.log(`Error while fetching Icon for server (${result.data.host}:${result.data.port}): \n${err.message}`)
        res.writeHead(200, { "content-type": 'image/png' })
        const icon = fs.readFileSync(path.join(__dirname + '/../icon.png')) 
        res.end(icon)
        global.redis.set(`icon:${result.data.host}-${result.data.port}`, `data:image/png;base64,${icon.toString('base64')}`, "EX", ms(process.env.ICON_CACHE)/1000)
    })
}