const express = require('express');
const port = 3000;
const app = express();
const bodyParser = require('body-parser');
require('./db');
require('./models/User');
const authRoutes = require('./routes/authRoutes');
//requireToken skipped
app.use(bodyParser.json());
app.use(authRoutes);

app.get('/',(req,res)=>{
    res.send('hello world');
    console.log('hello world');
})

app.listen(port,()=>{
    console.log('server is running on port' + port);
})

