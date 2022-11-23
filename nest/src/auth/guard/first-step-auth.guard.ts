import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class FirstStepAuthGuard extends AuthGuard('first-step') {}