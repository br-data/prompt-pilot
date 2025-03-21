import { Router } from 'express';
import multer, { StorageEngine } from 'multer';
import path from 'path';
import { fileUploadController, getFileController } from '../controllers/fileUpload.controller';

const fileUploadRouter = Router();

const volumePath = process.env.VOLUME_PATH || '/data/storage/';

const storage: StorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, volumePath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

fileUploadRouter.post('/', upload.array('files', 10), fileUploadController);

fileUploadRouter.get('/files/:filename', getFileController);

export { fileUploadRouter };