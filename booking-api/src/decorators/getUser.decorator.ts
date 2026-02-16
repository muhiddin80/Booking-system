import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { JwtPayload } from 'src/types/jwt';

interface RequestWithUser extends Request {
  user: JwtPayload;
}

export const GetUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    const user = request.user;
    return data ? user?.[data] : user;
  },
);
