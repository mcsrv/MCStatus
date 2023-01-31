const { sendVote } = require("minecraft-server-util")

module.exports=async function(req,res) {
    const {username, host, port, timestamp, secret, apiKey} = req.body   

    await sendVote(host, port, {
        username,
        address,
        timestamp: timestamp ?? Date.now(),
        token: secret,
        serviceName: apiKey === process.env.API_KEY ? "MCSRV.org" : "MCSRV.org - Test Vote", 
        timeout: 5000, 
    }).then(() => {
        return res.end(JSON.stringify({success: true}))
    }).catch(err => {
        return res.end(JSON.stringify({error: err.message}))
    })
}