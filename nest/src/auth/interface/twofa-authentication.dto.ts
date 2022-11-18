import { IsNotEmpty, IsString } from "class-validator";

export class TwofaAuthenticationDto
{
    @IsString()
    @IsNotEmpty()
    readonly token: string
}