require('dotenv').config();
const Polka = require('polka');
const chalk = require('chalk');
const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL); global.redis=redis;
const app = Polka();

app.use(require('express-status-monitor')())

app.get('/status/java/:address', require('./routes/java_status'))
app.get('/status/bedrock/:address', require('./routes/bedrock_status'))
app.get('/icon/:address', require('./routes/icon'))
app.post('/vote', require('./routes/vote'))


app.listen(process.env.PORT, (err) => {
    if(err) { console.log(err); process.env(1) };
    console.log(`[MCStatus] Listening on port: ` + chalk.green(process.env.PORT))
})
redis.on('connect', () => console.log("[MCStatus] Connected to Redis DB."))