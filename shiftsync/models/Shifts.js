import mongoose from "mongoose";
import { connectDB } from "@/lib/dbConnect";


const ShiftSchema = mongoose.Schema({
    userId : {type:mongoose.Schema.ObjectId, ref:'User', required:true},
    startDateTime :{type:Date},
    endDateTime: {type: Date},
    source:{type:String, default:"ocr"}


}, {timestamps:true});


ShiftSchema.index({userId:1, startDateTime:1});


export default mongoose.models.Shifts || mongoose.model("Shifts",ShiftSchema );

