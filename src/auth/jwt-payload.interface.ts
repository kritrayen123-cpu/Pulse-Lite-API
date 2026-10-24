import { Request } from 'express';
import { Role } from '../common/enums/roles.enum';

export interface JwtPayload {
  sub: string; 
  role: Role;
}

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}