import {IsNotEmpty, IsNumber, IsString} from "class-validator"
import { PartialType } from "@nestjs/mapped-types"

export class CreateUserDto
{
    @IsString()
    @IsNotEmpty()
    readonly userName: string

    @IsNumber()
    @IsNotEmpty()
    readonly id42: number

    @IsString()
    @IsNotEmpty()
    readonly email: string

    @IsString()
    @IsNotEmpty()
    readonly avatar: string
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}