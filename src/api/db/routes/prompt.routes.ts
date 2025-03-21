import { Router } from 'express';
import {
  getPrompts,
  createPrompt,
  updatePrompt,
  deletePrompt
} from '../controllers/prompt.controller';

export const promptRouter = Router();

promptRouter.get('/', getPrompts);

promptRouter.post('/', createPrompt);

promptRouter.put('/:id', updatePrompt);

promptRouter.delete('/:id', deletePrompt);