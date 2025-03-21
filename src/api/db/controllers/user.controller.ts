import { Request, Response } from 'express';
import { prisma } from '../prismaClient';
import { isTestEnabled } from '../../../utils/isTestEnabled';


export async function getUserFromXAuth(req: Request, res: Response): Promise<void> {
  if (isTestEnabled()) {
    res.json({ email: 'testvorname.testnachname@br.de' });
    return;
  }
  const email = req.headers['x-auth-request-email'];
  res.json({ email });
}

export async function getUserByEmail(req: Request, res: Response): Promise<void> {
  const { email } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      res.status(404).json({ message: 'User nicht gefunden' });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Fehler beim Abrufen des Users:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
}

export async function getAllUsers(req: Request, res: Response): Promise<void> {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error('Fehler beim Abrufen der Nutzerliste:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
}

export async function createUser(req: Request, res: Response): Promise<void> {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ error: 'Email ist erforderlich' });
    return;
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      res.status(200).json({ message: 'User existiert bereits', user: existingUser });
      return;
    }

    const newUser = await prisma.user.create({
      data: { email }
    });

    res.status(201).json({ message: 'User erfolgreich erstellt', user: newUser });
  } catch (error) {
    console.error('Fehler beim Erstellen des Users:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
}

export async function updateUser(req: Request, res: Response): Promise<void> {
  const userId = parseInt(req.params.id, 10);
  const { admin } = req.body;

  if (typeof admin !== 'boolean') {
    res.status(400).json({ error: '"admin" muss vom Typ boolean sein.' });
    return;
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { admin }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Adminstatus aktualisieren fehlgeschlagen.' });
  }
}