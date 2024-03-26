import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TokenExpiredError } from 'jsonwebtoken';

@Injectable()
export class RefreshTokenGuard extends AuthGuard('jwt-refresh') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Call the parent canActivate method
    const canActivate = await super.canActivate(context);

    // If the parent canActivate returns false (i.e., authentication failed), return false as well
    if (!canActivate) {
      return false;
    }

    // Check if the user is authenticated
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      // Handle the case where the user is not authenticated
      throw new UnauthorizedException('Forbidden');
    }

    return true;
  }

  handleRequest(err, user) {
    // Check if the error is a TokenExpiredError
    if (err instanceof TokenExpiredError) {
      // Throw a custom UnauthorizedException with "Forbidden" message
      throw new UnauthorizedException('Forbidden');
    }

    // If it's not a TokenExpiredError, return the user (authentication successful)
    return user;
  }
}
