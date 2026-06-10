import mongoose from "mongoose";



 export const connectDB = async (params) => {

const MONGOURI = process.env.MONGODB_URI;

try {
  // Pass your MONGOURI variable directly into the connect function!
  await mongoose.connect(MONGOURI); 
  console.log("Connection established successfully 🎉");
} catch(e) {
  console.error("Connection failed:", e.message);
}
}


