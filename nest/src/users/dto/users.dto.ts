import {IsNotEmpty, IsString} from "class-validator"
import { PartialType } from "@nestjs/mapped-types"

export class CreateUserDto
{
    @IsString()
    @IsNotEmpty()
    readonly userName: string

    @IsString()
    @IsNotEmpty()
    readonly email: string

    @IsString()
    @IsNotEmpty()
    readonly password: string

    @IsString()
    @IsNotEmpty()
    readonly avatar: string
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}