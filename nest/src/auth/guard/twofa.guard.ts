import { AuthGuard } from "@nestjs/passport";

export class TwoFaGuard extends AuthGuard('twofa') {}