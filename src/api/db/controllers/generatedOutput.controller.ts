import { Request, Response } from 'express';
import { prisma } from '../prismaClient';

export async function getGeneratedOutput(req: Request, res: Response) {
  const { id } = req.query;

  try {
    const data = await prisma.generatedOutput.findMany({
      where: id ? { annotationListId: parseInt(id as string, 10) } : {},
      include: {
        feedbacks: true,
        sourceRelation: {
          include: {
            files: true
          }
        },
        logs: {
          orderBy: {
            id: 'asc'
          }
        }
      }
    });

    res.json(data);
  } catch (error) {
    console.error('Fehler beim Abrufen des generierten Outputs:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen des generierten Outputs' });
  }
}

export async function createGeneratedOutput(req: Request, res: Response) {
  const { content, source, versionId, annotationListId, logs } = req.body;

  const parsedVersionId = parseInt(versionId, 10);
  const parsedAnnotationListId = parseInt(annotationListId, 10);

  if (isNaN(parsedVersionId) || isNaN(parsedAnnotationListId)) {
    res
      .status(400)
      .json({ error: 'Die Felder "versionId" und "annotationListId" müssen gültige IDs sein.' });
  }

  try {
    const newGeneratedOutput = await prisma.generatedOutput.create({
      data: {
        content,
        source: `${source.title} ${source.content}`,
        sourceRelation: { connect: { id: source.id } },
        version: { connect: { versionId: parsedVersionId } },
        annotationList: { connect: { id: parsedAnnotationListId } }
      }
    });

    if (logs && Array.isArray(logs) && logs.length > 0) {
      await prisma.log.createMany({
        data: logs.map((log: any) => ({
          msg: log.msg,
          status: log.status,
          start: log.start ?? null,
          end: log.end ?? null,
          attempt: log.attempt ?? null,
          generatedOutputId: newGeneratedOutput.id,
          response: log.response ?? null,
          call: log.call ?? null
        }))
      });
    }

    res.status(201).json(newGeneratedOutput);
  } catch (error) {
    console.error('Fehler beim Erstellen des generierten Outputs:', error);
    res.status(500).json({ error: 'Fehler beim Erstellen des generierten Outputs.' });
  }
}