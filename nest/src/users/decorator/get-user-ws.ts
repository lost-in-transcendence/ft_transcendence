import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const GetUserWs = createParamDecorator((data: string | undefined, ctx: ExecutionContext) =>
{
    const wsClient = ctx.switchToWs().getClient();
    if (data)
        return (wsClient.data.user[data]);
    return (wsClient.data.user);
})
