import { Request, Response, NextFunction } from 'express';

export function validateRequestBody(requiredFields: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    for (const field of requiredFields) {
      if (!req.body[field]) {
        res.status(400).json({ error: `${field} ist erforderlich.` });
        return;
      }
    }
    return next();
  };
}