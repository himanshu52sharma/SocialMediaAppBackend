const mongoose = require('mongoose');
require('dotenv').config();


mongoose.connect(process.env.mongo_URL).then(
    ()=>{
        console.log('connected to database');
    }
).catch((err)=>{
      console.log('error connecting to database' + err);
})


// mongoose.connect('mongodb+srv://himanshu123:12345@cluster0.k8cpzew.mongodb.net/?retryWrites=true&w=majority').then(
//     ()=>{
//         console.log('connected to database');
//     }
// ).catch((err)=>{
//       console.log('error connecting to database' + err);
// })