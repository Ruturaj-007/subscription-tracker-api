import { JWT_SECRET } from "../config/env.js";
import jwt from 'jsonwebtoken'  // use to create and validate token
import User from "../models/user.model.js";

const authorize = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        // frontend sends token Authorization: Bearer eyJhbGciOi... so  this checks authorization header starts with "Bearer"

        
        if (!token) return res.status(401).json({
            message : 'Unauthorized'
        });

        // JWT verifies token not modified, signed with correct secret not expired 
        const decoded = jwt.verify(token, JWT_SECRET);
        
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(401).json({
                message: 'Unauthorized'
            });
        }

        req.user = user;

        next()  // continue authentication passed 
    } catch (error) {
        res.status(401).json({
            message: 'Unauthorized',
            error: error.message
        })
    }
}

export default authorize;

    /*
        Frontend sends token
                ↓
        Middleware extracts token
                ↓
        JWT verifies token
                ↓
        Gets user info from token
                ↓
        Attaches user to req.user
                ↓
        Allows access to protected route
    */