import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import { Role } from 'src/users/enums/role';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('role', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }

    const contextHttp = context.switchToHttp().getRequest();
    const token = contextHttp.headers.authorization.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET) as jwt.JwtPayload;
    const role = requiredRoles.some((role) => payload.role?.includes(role));
    return role;
  }
}
