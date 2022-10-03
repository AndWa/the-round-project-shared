import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class PassportJwtDuplicationFixInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const bearer = request.headers['authorization'];

    if (!bearer) return next.handle();

    let token = bearer.split(' ')[1];

    if (!token) {
      return next.handle();
    }

    if (token.includes(',')) {
      token = token.replace(',', '');
      request.headers['authorization'] = `Bearer ${token}`;
    }

    return next.handle();
  }
}
