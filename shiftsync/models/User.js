import mongoose from "mongoose";


const userModel = mongoose.Schema({
    name: String,
    email: {type:String, required:true},
    password:{type:String, required:true},
    createdAt:{type:Date, default:Date.now}

        

})



// Replace your old "export default mongoose.model('User', userModel);" with this:
export default mongoose.models.User || mongoose.model('User', userModel);