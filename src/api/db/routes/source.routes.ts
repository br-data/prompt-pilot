import { Router } from 'express';
import {
  getSources,
  createSource,
  updateSource,
  deleteSource
} from '../controllers/source.controller';

export const sourceRouter = Router();

sourceRouter.get('/', getSources);

sourceRouter.post('/', createSource);

sourceRouter.put('/', updateSource);

sourceRouter.delete('/', deleteSource);