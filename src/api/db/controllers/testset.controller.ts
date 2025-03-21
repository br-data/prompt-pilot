import { Request, Response } from 'express';
import { prisma } from '../prismaClient';
import { Prisma } from '@prisma/client';

export async function getTestsets(req: Request, res: Response): Promise<void> {
  const { id } = req.query;

  try {
    const data = await prisma.testset.findMany({
      where: id ? { id: parseInt(id as string, 10) } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        sources: true,
        createdBy: true
      }
    });
    res.json(data);
  } catch (error) {
    console.error('Fehler beim Abrufen der Quellen-Sammlung:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Quellen-Sammlung' });
  }
}

export async function updateTestset(req: Request, res: Response): Promise<void> {
  const { id, title, description, public: publicAvailable } = req.body;

  if (!id || (!title && !description)) {
    res.status(400).json({
      error: 'Eine gültige ID und mindestens ein Feld (title, description) sind erforderlich.'
    });
    return;
  }

  try {
    const updateData = {
      ...(title && { title }),
      ...(description && { description }),
      ...(publicAvailable !== undefined && { public: publicAvailable })
    };

    const updatedTestset = await prisma.testset.update({
      where: { id: parseInt(id, 10) },
      data: updateData
    });

    res.status(200).json({
      message: 'Quellen-Sammlung erfolgreich aktualisiert.',
      testset: updatedTestset
    });
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Quellen-Sammlung:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      res.status(404).json({ error: 'Quellen-Sammlung nicht gefunden.' });
      return;
    }

    res
      .status(500)
      .json({ error: 'Interner Fehler beim Aktualisieren des Quellen-Sammlung.' });
  }
}

export async function createTestset(req: Request, res: Response): Promise<void> {
  const { title, description, createdById, public: publicAvailable } = req.body;

  try {
    const newTestset = await prisma.testset.create({
      data: {
        title,
        ...(description && { description }),
        ...(createdById && { createdById }),
        ...(publicAvailable !== undefined && { public: publicAvailable })
      }
    });

    res.status(201).json(newTestset);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Fehler beim Erstellen der Quellen-Sammlung.' });
  }
}

export async function deleteTestset(req: Request, res: Response): Promise<void> {
  const { id } = req.query;

  if (!id) {
    res.status(400).json({ error: 'Das Feld "id" ist erforderlich.' });
    return;
  }

  try {
    await prisma.$transaction(async (prismaTx) => {
      await prismaTx.source.deleteMany({
        where: { testsetId: parseInt(id as string, 10) }
      });

      await prismaTx.testset.delete({
        where: { id: parseInt(id as string, 10) }
      });
    });

    res.status(200).json({
      message: 'Quellen-Sammlung und zugehörige Quellen erfolgreich gelöscht.'
    });
  } catch (error) {
    console.error('Fehler beim Löschen der Quellen-Sammlung:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      res.status(404).json({ error: 'Quellen-Sammlung nicht gefunden.' });
      return;
    }

    res.status(500).json({ error: 'Fehler beim Löschen der Quellen-Sammlung.' });
  }
}