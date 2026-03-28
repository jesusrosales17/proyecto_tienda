import type {Request, Response, NextFunction} from "express";
import jwt, { type JwtPayload } from 'jsonwebtoken';


export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
   if() 
  } catch (error) {
    return next(error);
  }
}
