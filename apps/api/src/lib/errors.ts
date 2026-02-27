import { Response } from 'express';
import { Prisma } from '@prisma/client';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource}을(를) 찾을 수 없습니다`);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = '권한이 없습니다') {
    super(403, message);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(400, message);
  }
}

export function handleError(error: unknown, res: Response) {
  console.error('Error:', error);

  // Custom AppError
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: error.message,
      statusCode: error.statusCode
    });
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return res.status(409).json({ error: '중복된 데이터가 존재합니다' });
      case 'P2003':
        return res.status(400).json({ error: '참조 무결성 제약 위반' });
      case 'P2025':
        return res.status(404).json({ error: '데이터를 찾을 수 없습니다' });
      default:
        return res.status(500).json({ error: '데이터베이스 오류가 발생했습니다' });
    }
  }

  // Generic error
  const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다';
  return res.status(500).json({ error: message });
}
