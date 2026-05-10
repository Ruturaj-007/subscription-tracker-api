import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Username is required'],
        trim : true,
        minLength : 2,
        maxLength : 50
    },
    email: {
        type : String,
        required: [true, 'User email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/\S+@\S+\.\S+/, 'Please fill in email address'],
    },
    password: {
        type: String,
        required: [true, 'User Password is required'],
        minLength: 6
    }
}, {timestamps: true});

const User = mongoose.model('User', userSchema);
export default User;