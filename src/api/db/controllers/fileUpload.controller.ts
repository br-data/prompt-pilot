import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { prisma } from '../prismaClient';

export async function fileUploadController(req: Request, res: Response): Promise<void> {
  try {
    const { sourceId } = req.query;
    const files = req.files as Express.Multer.File[];

    if (!files?.length || !sourceId) {
      res.status(400).json({ error: 'Fehlende Dateien oder sourceId' });
    }

    const uploadedFiles = [];
    for (const file of files) {
      const newFile = await prisma.file.create({
        data: {
          name: file.originalname,
          url: file.filename,
          sourceId: Number(sourceId),
        },
      });
      uploadedFiles.push(newFile);
    }

    res.json({
      message: 'Mehrere Dateien hochgeladen und gespeichert',
      files: uploadedFiles,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Fehler beim Upload mehrerer Dateien' });
  }
}

export async function getFileController(req: Request, res: Response): Promise<void> {
  const { filename } = req.params;
  const volumePath = process.env.VOLUME_PATH || '/data/storage/';
  const absoluteFilePath = path.resolve(volumePath, filename);

  if (!fs.existsSync(absoluteFilePath)) {
    res.status(404).json({ error: 'Datei nicht gefunden' });
  }

  res.sendFile(absoluteFilePath);
}