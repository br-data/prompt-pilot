import { Router } from 'express';
import {
  getUserFromXAuth,
  getUserByEmail,
  getAllUsers,
  createUser,
  updateUser
} from '../controllers/user.controller';

export const userRouter = Router();

userRouter.get('/fromxauth', getUserFromXAuth);

userRouter.get('/:email', getUserByEmail);

userRouter.get('/', getAllUsers);

userRouter.post('/', createUser);