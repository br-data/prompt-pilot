import { Router } from 'express';
import { validateRequestBody } from '../utils/validateRequestBody';
import {
  createFeedback,
  getFeedback,
  updateFeedback
} from '../controllers/feedback.controller';

export const feedbackRouter = Router();

feedbackRouter.get('/', getFeedback);

feedbackRouter.post(
  '/',
  validateRequestBody(['userId', 'generatedOutputId']),
  createFeedback
);

feedbackRouter.put('/:id', updateFeedback);