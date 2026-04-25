import mongoose from "mongoose";
import { DB_URI } from "../config/env.js";

if (!DB_URI) {
    throw new Error('Please define the MONGODB_URI enviorement variable inside .env<development/production>.local');    
}

const connectToDatabase = async () => {
    try {
        await mongoose.connect(DB_URI);
        console.log('Connected to database ')
    } catch (error) {
        console.log('Error connecting to database', error)
        process.exit(1);
    }
}

export default connectToDatabase;