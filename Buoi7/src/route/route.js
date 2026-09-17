import { Router } from 'express';
import userRouter from './users.route.js';
import authRouter from './auth.route.js';

const router = Router();

router.use('/users', userRouter);
router.use('/auth', authRouter);

export default router;
