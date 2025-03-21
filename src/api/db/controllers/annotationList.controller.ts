import { Request, Response } from 'express';
import { prisma } from '../prismaClient';

export async function getAnnotationLists(req: Request, res: Response): Promise<void> {
  const id = req.query.id as string | undefined;
  const title = req.query.title as string | undefined;
  const testset = req.query.testset as string | undefined;

  try {
    const where: any = {};

    if (id) {
      const parsedId = parseInt(id, 10);
      if (isNaN(parsedId)) {
        res.status(400).json({ error: 'Ungültige ID' });
        return;
      }
      where.id = parsedId;
    }

    if (title) {
      where.title = {
        contains: title,
        mode: 'insensitive'
      };
    }

    if (testset) {
      where.testset = testset;
    }

    const annotationLists = await prisma.annotationList.findMany({
      where,
      include: {
        prompts: true,
        generatedOutput: {
          include: {
            version: true,
            feedbacks: true
          }
        },
        createdBy: true
      },
      orderBy: [{ createdAt: 'desc' }]
    });

    res.json(annotationLists);
  } catch (error) {
    console.error('Fehler beim Abrufen der AnnotationLists:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
}

export async function getAnnotationListById(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Ungültige ID' });
    return;
  }
  try {
    const annotationList = await prisma.annotationList.findUnique({
      where: { id },
      include: {
        prompts: true,
        generatedOutput: {
          include: {
            feedbacks: true,
            logs: {
              orderBy: {
                id: 'asc'
              }
            }
          }
        },
        createdBy: true
      }
    });

    if (!annotationList) {
      res.status(404).json({ error: 'Nicht gefunden' });
      return;
    }

    res.json(annotationList);
  } catch (error) {
    console.error('Fehler beim Abrufen der AnnotationList:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
}

export async function updateAnnotationList(req: Request, res: Response): Promise<void> {
  const id = req.query.id as string; // wie im Original
  const { title, description, testset, promptIds, testsetName, public: publicAvailable } = req.body;

  if (!id) {
    res.status(400).json({ error: 'Der Query-Parameter "id" ist erforderlich' });
    return;
  }

  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId)) {
    res.status(400).json({ error: 'Ungültige ID' });
    return;
  }

  if (promptIds && !Array.isArray(promptIds)) {
    res.status(400).json({ error: 'promptIds muss ein Array von Zahlen sein.' });
    return;
  }

  try {
    const data: any = {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(testset !== undefined && { testset }),
      ...(testsetName !== undefined && { testsetName }),
      ...(publicAvailable !== undefined && { public: publicAvailable })
    };

    if (promptIds) {
      data.prompts = {
        set: promptIds.map((pId: number) => ({ versionId: pId }))
      };
    }

    const updatedAnnotationList = await prisma.annotationList.update({
      where: { id: parsedId },
      data,
      include: {
        prompts: true
      }
    });

    res.json(updatedAnnotationList);
  } catch (error) {
    console.error('Fehler beim Aktualisieren der AnnotationList:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
}

export async function createAnnotationList(req: Request, res: Response): Promise<void> {
  const { title, description, testset, prompts, testsetName, runs, createdById, public: publicAvailable } = req.body;

  if (!title || typeof title !== 'string') {
    res.status(400).json({ error: 'Das Feld "title" ist erforderlich und muss ein String sein.' });
    return;
  }

  if (!testset || typeof testset !== 'number') {
    res.status(400).json({
      error: 'Das Feld "testset" ist erforderlich und muss eine Zahl sein (die ID des Testsets).'
    });
    return;
  }

  if (
    !prompts ||
    !Array.isArray(prompts) ||
    !prompts.every((prompt: { versionId: number }) => typeof prompt.versionId === 'number')
  ) {
    res
      .status(400)
      .json({ error: 'Das Feld "prompts" ist erforderlich und muss ein Array von Objekten sein.' });
    return;
  }

  if (!createdById || typeof createdById !== 'number') {
    res.status(400).json({
      error: 'Das Feld "createdById" ist erforderlich und muss vom Typ number sein.'
    });
    return;
  }

  try {
    const data: any = {
      title,
      description,
      testsetName,
      runs,
      prompts: {
        connect: prompts.map((p: { versionId: number }) => ({ versionId: p.versionId }))
      },
      testsetRef: { connect: { id: testset } },
      createdBy: createdById ? { connect: { id: createdById } } : undefined,
      public: publicAvailable
    };

    const newAnnotationList = await prisma.annotationList.create({
      data,
      include: {
        prompts: true,
        testsetRef: {
          include: {
            sources: {
              include: {
                files: true
              }
            }
          }
        }
      }
    });

    res.status(201).json(newAnnotationList);
  } catch (error) {
    console.error('Fehler beim Erstellen der AnnotationList:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
}

export async function deleteAnnotationList(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    res.status(400).json({ error: 'Ungültige ID' });
    return;
  }

  try {
    const annotationList = await prisma.annotationList.findUnique({
      where: { id },
      include: {
        generatedOutput: {
          include: {
            feedbacks: true
          }
        }
      }
    });

    if (!annotationList) {
      res.status(404).json({ error: 'AnnotationList nicht gefunden' });
      return;
    }

    const feedbackIds = annotationList.generatedOutput.flatMap((output) =>
      output.feedbacks.map((fb) => fb.id)
    );

    if (feedbackIds.length > 0) {
      await prisma.feedback.deleteMany({
        where: {
          id: {
            in: feedbackIds
          }
        }
      });
    }

    const generatedOutputIds = annotationList.generatedOutput.map((out) => out.id);

    if (generatedOutputIds.length > 0) {
      await prisma.generatedOutput.deleteMany({
        where: {
          id: {
            in: generatedOutputIds
          }
        }
      });
    }

    await prisma.annotationList.delete({
      where: { id }
    });

    res.status(200).json({ message: 'AnnotationList erfolgreich gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen der AnnotationList:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
}