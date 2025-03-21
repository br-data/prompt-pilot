import { Router } from 'express';
import { getModels } from '../controllers/models.controller';

export const modelsRouter = Router();

modelsRouter.get('/', getModels);