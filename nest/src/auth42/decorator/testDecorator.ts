import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// export const TestGuard = createParamDecorator(
// 	(ctx: ExecutionContext) => {
//     console.log("TESTGUARD ICI")
//     return ;
//   },
// );

export const TestGuard = (): any => {console.log("Test ici");}