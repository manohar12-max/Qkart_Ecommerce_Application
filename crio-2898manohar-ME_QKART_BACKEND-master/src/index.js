const mongoose = require("mongoose");
const express=require("express")
const app = require("./app");
const config = require("./config/config");



// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Create Mongo connection and get the express app to listen on config.port
mongoose.connect(config.mongoose.url, config.mongoose.options)
.then(()=> console.log(`Connected to mongoDB ${config.mongoose.url}` ))
.catch((err)=> console.log(err))     

app.listen(config.port,()=>{
    console.log("Listening to port",config.port) 
})
