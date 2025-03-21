import { Router } from 'express';
import { validateRequestBody } from '../utils/validateRequestBody';
import { createGeneratedOutput, getGeneratedOutput } from '../controllers/generatedOutput.controller';


export const generatedOutputRouter = Router();

generatedOutputRouter.get('/', getGeneratedOutput);

generatedOutputRouter.post(
  '/',
  validateRequestBody(['content', 'source', 'versionId', 'annotationListId']),
  createGeneratedOutput
);