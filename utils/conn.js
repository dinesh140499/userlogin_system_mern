const mongoose=require('mongoose')

mongoose.connect(process.env.DATABASE).then(()=>console.log("database connected")).catch((e)=>console.log('database not connected'))