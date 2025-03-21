import { Request, Response } from 'express';
import { prisma } from '../prismaClient';

export async function getFeedback(req: Request, res: Response) {
  const { id } = req.query;

  try {
    const data = await prisma.feedback.findMany({
      where: id ? { generatedOutputId: parseInt(id as string, 10) } : {}
    });
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Fehler beim Abrufen des Feedbacks' });
  }
}

export async function createFeedback(req: Request, res: Response) {
  const { reviewEffortScale, feedbackTextPositive, feedbackTextNegative, userId, generatedOutputId } = req.body;

  const parsedUserId = parseInt(userId, 10);
  const parsedGeneratedOutputId = parseInt(generatedOutputId, 10);

  if (isNaN(parsedUserId) || isNaN(parsedGeneratedOutputId)) {
    res.status(400).json({
      error: 'Die Felder "userId" und "generatedOutputId" müssen gültige IDs sein.'
    });
  }

  try {
    const newFeedback = await prisma.feedback.create({
      data: {
        reviewEffortScale: reviewEffortScale,
        feedbackTextPositive: feedbackTextPositive || null,
        feedbackTextNegative: feedbackTextNegative || null,
        userId: parsedUserId,
        generatedOutputId: parsedGeneratedOutputId
      }
    });

    res.status(201).json(newFeedback);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Fehler beim Erstellen des Feedbacks.' });
  }
}

export async function updateFeedback(req: Request, res: Response) {
  const { id } = req.params;
  const { reviewEffortScale, feedbackTextPositive, feedbackTextNegative } = req.body;

  try {
    const updatedFeedback = await prisma.feedback.update({
      where: { id: parseInt(id, 10) },
      data: {
        reviewEffortScale: reviewEffortScale || undefined,
        feedbackTextPositive:
          feedbackTextPositive !== undefined ? feedbackTextPositive : undefined,
        feedbackTextNegative:
          feedbackTextNegative !== undefined ? feedbackTextNegative : undefined
      }
    });

    res.json(updatedFeedback);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Fehler beim Aktualisieren des Feedbacks.' });
  }
}