import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

export const RequestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const requestId = req.headers['x-request-id'] || randomUUID();
  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-Id', requestId);
  next();
};
