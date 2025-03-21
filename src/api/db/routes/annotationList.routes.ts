import { Router } from 'express';
import {
  getAnnotationLists,
  getAnnotationListById,
  updateAnnotationList,
  createAnnotationList,
  deleteAnnotationList
} from '../controllers/annotationList.controller';

export const annotationListRouter = Router();

annotationListRouter.get('/', getAnnotationLists);

annotationListRouter.get('/:id', getAnnotationListById);

annotationListRouter.put('/', updateAnnotationList);

annotationListRouter.post('/', createAnnotationList);

annotationListRouter.delete('/:id', deleteAnnotationList);