import { ExceptionFilter, Catch, HttpException, HttpStatus, ArgumentsHost } from '@nestjs/common';
import { TokenExpiredError } from 'jsonwebtoken';

@Catch(TokenExpiredError)
export class TokenExpiredFilter implements ExceptionFilter {
    catch(exception: TokenExpiredError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const status = HttpStatus.FORBIDDEN;

        response.status(status).json({
            statusCode: status,
            message: 'Forbidden',
        });
    }
}


