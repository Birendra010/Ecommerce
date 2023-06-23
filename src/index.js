
const express = require('express')
const dotenv = require('dotenv')
const mongoose = require('mongoose');
const route = require('./route/route');
const app = express();

dotenv.config({path:"../config.env"})
app.use(express.json());
app.use('/',route);


mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true
})

.then(() => console.log("MongoDb is connected"))
.catch(err => console.log(err))

const server = app.listen(process.env.PORT, ()=> {
    console.log(`Express app running on port ${process.env.PORT}...`)
});
module.exports=server;