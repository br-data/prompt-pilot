import express from 'express';
import path from 'path';
import cors from 'cors';
import bodyParser from 'body-parser';
import { prisma } from './prismaClient';
import {
  userRouter,
  promptRouter,
  sourceRouter,
  testsetRouter,
  annotationListRouter,
  generatedOutputRouter,
  feedbackRouter,
  fileUploadRouter,
  modelsRouter,
  generateRouter
} from './routes';
import { isTestEnabled } from '../../utils/isTestEnabled';

const app = express();
const PORT = 3003;

if (isTestEnabled()) {
  app.use(cors({ origin: 'http://localhost:8100' }));
}

app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));

const staticDir = 'build';
app.use(express.static(staticDir));

app.use('/user', userRouter);
app.use('/source', sourceRouter);
app.use('/testset', testsetRouter);
app.use('/annotationlist', annotationListRouter);
app.use('/generatedOutput', generatedOutputRouter);
app.use('/feedback', feedbackRouter);
app.use('/upload', fileUploadRouter);
app.use('/models', modelsRouter);
app.use('/prompt', promptRouter);
app.use('/generate', generateRouter);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../build', 'index.html'));
});

process.on('SIGINT', async () => {
  console.log('Server wird heruntergefahren...');
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server läuft auf Port ${PORT}`);
});