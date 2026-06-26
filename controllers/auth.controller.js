import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/user.model.js";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env.js";

// * ATOMIC OPERATIONS
// db operations that update the state, Insert either works completely or it doesn't 
export const signUp  = async (req, res, next) => {

    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {

        const { name, email, password} = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({email});
        
        if (existingUser) {
            const error = new Error("User already exists");
            error.statusCode = 409;
            throw error
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        
        // Creating the User based on User model which starts with capital 
        const newUsers = await User.create([{
            name,
            email,
            password : hashedPassword
        }], {session}); // Tells Mongoose: "Run this insert inside my transaction"


         // GENERATE TOKEN
        const token = jwt.sign(
            {
                userId: newUsers[0]._id // You need [0] to unwrap the user from the array before sending it in the JSON response.
            },
            JWT_SECRET,
            {
                expiresIn: JWT_EXPIRES_IN
            }
        );
        
        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            success : true,
            message : 'User Created Successfully',
            data : {
                token,
                user : newUsers[0]
            }
        })
    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        next(error);
    }

}
// SIGN IN
export const signIn = async (req, res, next) => {
    try {
        const {email, password} = req.body;

        const user = await User.findOne({email});

        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        // Compares Plain text password from login form & hashes passowrd stored in db 
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            const error = new Error('Invalid Password');
            error.statusCode = 401;
            throw error;
        }

        const token = jwt.sign({
            userId: user._id
        }, 
        JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN
        }
    );

    // REMOVE PASSWORD
    const userWithoutPassword = {
        _id: user._id,
        name: user.name,
        email: user.email
    };

    res.status(200).json({
        success: true,
        message: "User signed in successfully",
        data : {
            // Not returning full user object
            token, 
            user: userWithoutPassword
        }
    })

    } catch (error) {
        next(error);
    }
};

// SIGN OUT
export const signOut = async (req, res, next) => {
    
};