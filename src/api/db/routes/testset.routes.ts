import { Router } from 'express';
import { validateRequestBody } from '../utils/validateRequestBody';
import {
  getTestsets,
  updateTestset,
  createTestset,
  deleteTestset
} from '../controllers/testset.controller';

export const testsetRouter = Router();

testsetRouter.get('/', getTestsets);

testsetRouter.put('/', updateTestset);

testsetRouter.post('/', validateRequestBody(['title', 'description', 'createdById']), createTestset);

testsetRouter.delete('/', deleteTestset);