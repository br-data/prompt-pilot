import { Request, Response } from 'express';
import { prisma } from '../prismaClient';
import { Prisma } from '@prisma/client';


export async function getPrompts(req: Request, res: Response): Promise<void> {
  const { id } = req.query;

  try {
    const data = await prisma.prompt.findMany({
      where: id ? { versionId: parseInt(id as string, 10) } : undefined,
      orderBy: [{ createdAt: 'desc' }],
      include: {
        createdBy: true
      }
    });
    res.json(data);
  } catch (error) {
    console.error('Fehler beim Abrufen der Prompts:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Prompts' });
  }
}

export async function createPrompt(req: Request, res: Response): Promise<void> {
  const {
    title,
    promptId,
    content,
    description,
    model,
    variance,
    createdById,
    public: publicAvailable,
    multimodal
  } = req.body;

  if (!title || !content || !model || !createdById || variance === undefined) {
    res.status(400).json({
      error: 'Die Felder "title", "content", "model", "createdById" und "variance" sind erforderlich.'
    });
    return;
  }

  if (!Number.isInteger(variance)) {
    res.status(400).json({ error: 'Das Feld "variance" muss eine ganze Zahl sein.' });
    return;
  }

  if (typeof content !== 'string') {
    res.status(400).json({ error: 'Das Feld "content" muss ein String sein.' });
    return;
  }

  try {
    const newPrompt = await prisma.prompt.create({
      data: {
        title,
        promptId,
        content,
        description,
        model,
        variance,
        ...(createdById && { createdById }),
        public: publicAvailable,
        multimodal
      },
      include: {
        createdBy: true
      }
    });

    res.status(201).json(newPrompt);
  } catch (error) {
    console.error('Fehler beim Erstellen des Prompts:', error);
    res.status(500).json({ error: 'Fehler beim Erstellen des Prompts.' });
  }
}

export async function updatePrompt(req: Request, res: Response): Promise<void> {
  const promptId = parseInt(req.params.id, 10);
  if (isNaN(promptId)) {
    res.status(400).json({ error: 'Ungültige ID' });
    return;
  }

  const { public: publicAvailable } = req.body;

  try {
    const updated = await prisma.prompt.update({
      where: { versionId: promptId },
      data: {
        ...(publicAvailable !== undefined && { public: publicAvailable })
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Prompts:', error);
    res.status(500).json({ error: 'Fehler beim Aktualisieren des Prompts' });
  }
}

export async function deletePrompt(req: Request, res: Response): Promise<void> {
  const promptId = parseInt(req.params.id, 10);

  if (isNaN(promptId)) {
    res.status(400).json({ error: 'Ungültige ID' });
    return;
  }

  try {
    const hasDependencies =
      (await prisma.generatedOutput.findFirst({
        where: { versionId: promptId }
      })) ||
      (await prisma.annotationList.findFirst({
        where: { prompts: { some: { versionId: promptId } } }
      }));

    if (hasDependencies) {
      res.status(400).json({
        error: 'Der Prompt kann nicht gelöscht werden, da zugehörige Test-Einträge existieren.'
      });
      return;
    }

    const deletedPrompt = await prisma.prompt.delete({
      where: { versionId: promptId }
    });

    res.status(200).json({
      message: 'Prompt erfolgreich gelöscht.',
      deletedPrompt
    });
  } catch (error) {
    console.error('Fehler beim Löschen des Prompts:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      res.status(404).json({ error: 'Prompt nicht gefunden.' });
      return;
    }

    res.status(500).json({ error: 'Fehler beim Löschen des Prompts.' });
  }
}