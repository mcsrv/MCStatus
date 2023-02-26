const { sendVote } = require("minecraft-server-util")

module.exports=async function(req,res) {
    const {username, address, port, timestamp, secret} = req.body   

    await sendVote(address, port, {
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