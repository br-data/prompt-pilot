import { Router } from 'express';
import { generateContent } from '../controllers/generate.controller';

export const generateRouter = Router();

generateRouter.post('/', generateContent);