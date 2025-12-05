import { type ROLE } from '@prisma/client';

export interface IJwtPayload {
  user_id: string;
  email: string;
  role: ROLE;
}
