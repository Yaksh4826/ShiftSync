import mongoose from "mongoose";


const jobProfileModel = mongoose.Schema({
    userId : {type:mongoose.Schema.ObjectId, ref:'User'},
    companyName: {type:String, required:true, },
    defaultRole:{type:String, required:true},
    location:{type:String, required:true},
    format:{type:[String], enum:["Online", "Offline", "Hybrid"]},
    createdAt:{type:Date, default:Date.now}



})



export default mongoose.model('JobProfile', jobProfileModel)