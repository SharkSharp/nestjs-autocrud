import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

export const UPDATE_ID = 'UPDATE_ID';

@Injectable()
export class InjectUpdateIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    if (request.body) {
      request.body[UPDATE_ID] = parseInt(request.params.id);
    }
    return next.handle();
  }
}
