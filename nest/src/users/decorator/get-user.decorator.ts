import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const GetUser = createParamDecorator((data: string | undefined, ctx: ExecutionContext) => 
{
    const req = ctx.switchToHttp().getRequest();
    // console.log(req.user);
    if (data)
        return (req.user[data]);
    return (req.user);
})