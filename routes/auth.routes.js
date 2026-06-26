import { Router } from 'express';
import { signUp, signIn, signOut } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.middleware.js';          
import { signUpSchema, signInSchema } from '../validations/auth.validation.js'; 

const authRouter = Router();

authRouter.post('/sign-up', validate(signUpSchema), signUp);   
authRouter.post('/sign-in', validate(signInSchema), signIn);   
authRouter.post('/sign-out', signOut);

export default authRouter;