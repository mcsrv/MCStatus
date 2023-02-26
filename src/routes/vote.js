const { sendVote } = require("minecraft-server-util")

module.exports=async function(req,res) {
    const {username, address, port, timestamp, secret} = req.body   
    
    if(!username) return res.writeHead(500).end(JSON.stringify({error: "Invalid username provided."}))
    if(!address) return res.writeHead(500).end(JSON.stringify({error: "Invalid address provided."}))
    if(!port || isNaN(parseInt(port))) return res.writeHead(500).end(JSON.stringify({error: "Invalid port provided."}))
    if(!secret) return res.writeHead(500).end(JSON.stringify({error: "Invalid secret provided."}))


    await sendVote(address, parseInt(port), {
        username,
        timestamp: timestamp ?? Date.now(),
        token: secret,
        serviceName:"MCSRV.org", 
        timeout: 5000, 
    }).then(() => {
        return res.end(JSON.stringify({success: true}))
    }).catch(err => {
        return res.end(JSON.stringify({error: err.message}))
    })
}