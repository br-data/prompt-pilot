import { Request, Response } from 'express';
import { prisma } from '../prismaClient';

export async function getSources(req: Request, res: Response): Promise<void> {
  const { id } = req.query;

  try {
    const data = await prisma.source.findMany({
      where: typeof id === 'string' ? { testsetId: parseInt(id, 10) } : {},
      orderBy: { createdAt: 'desc' },
      include: { files: true }
    });
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Quellen' });
  }
}

export async function createSource(req: Request, res: Response): Promise<void> {
  const { title, content, testsetId } = req.body;

  if (!content) {
    res.status(400).json({ error: 'Das Feld "content" ist erforderlich.' });
    return;
  }

  try {
    const newSource = await prisma.source.create({
      data: {
        title,
        content,
        testsetId
      }
    });
    res.status(201).json(newSource);
  } catch (error) {
    console.error('Fehler beim Erstellen der Quelle:', error);
    res.status(500).json({ error: 'Fehler beim Erstellen der Quelle.' });
  }
}

export async function updateSource(req: Request, res: Response): Promise<void> {
  const { id, title, content } = req.body;

  if (!id || (!title && !content)) {
    res.status(400).json({
      error: 'ID und mindestens ein Feld (title oder content) sind erforderlich.'
    });
    return;
  }

  try {
    const updatedSource = await prisma.source.update({
      where: { id: parseInt(id, 10) },
      data: {
        ...(title && { title }),
        ...(content && { content })
      }
    });

    res.status(200).json({ message: 'Quelle erfolgreich aktualisiert.', updatedSource });
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Quelle:', error);

    if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') {
      res.status(404).json({ error: 'Quelle nicht gefunden.' });
      return;
    }

    res.status(500).json({ error: 'Fehler beim Aktualisieren der Quelle.' });
  }
}

export async function deleteSource(req: Request, res: Response): Promise<void> {
  const { id } = req.query;

  if (!id) {
    res.status(400).json({ error: 'Das Feld "id" ist erforderlich.' });
    return;
  }

  try {
    console.log(`Lösche alle Files für Source-ID ${id}...`);

    await prisma.$transaction(async (prismaTx) => {
      await prismaTx.file.deleteMany({
        where: { sourceId: parseInt(id as string, 10) }
      });

      console.log(`Alle Files für Source-ID ${id} gelöscht.`);

      await prismaTx.source.delete({
        where: { id: parseInt(id as string, 10) }
      });

      console.log(`Quelle mit ID ${id} erfolgreich gelöscht.`);
    });

    res.status(200).json({ message: `Quelle mit ID ${id} erfolgreich gelöscht.` });
  } catch (error) {
    console.error('Fehler beim Löschen der Quelle:', error);
    res.status(500).json({ error: 'Fehler beim Löschen der Quelle.' });
  }
}