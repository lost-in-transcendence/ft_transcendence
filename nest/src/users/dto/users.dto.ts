import {IsBoolean, IsBooleanString, IsNotEmpty, IsNumber, IsOptional, IsString} from "class-validator"
import {Transform} from 'class-transformer'
import { PartialType } from "@nestjs/mapped-types"

export class CreateUserDto
{
    @IsString()
    @IsNotEmpty()
    readonly userName: string

    @IsNumber()
    @IsNotEmpty()
    readonly id42: string

    @IsString()
    @IsNotEmpty()
    readonly email: string

    @IsString()
    @IsNotEmpty()
    readonly avatarURL: string

    @IsString()
    @IsNotEmpty()
    readonly avatarPath?: string
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}

/*
** @desc Helper function to convert string parameter into boolean value
** 
** @param {string} value The value to convert (can sometimes be boolean??)
** @returns {boolean} Returns the converted boolean value
*/

export function toBoolean(value: string) : boolean
{
    if (typeof value === 'string')
        value = value.toLowerCase();
    if (typeof value === 'boolean')
        return value;
    return value === 'true' || value === '1' ? true : false;
}

export class UserIncludeQueryDto
{
    @Transform(({value}) => toBoolean(value))
    @IsBoolean()
    @IsOptional()
    readonly friends: boolean

    @Transform(({value}) => toBoolean(value))
    @IsBoolean()
    @IsOptional()
    readonly friendTo: boolean

    @Transform(({value}) => toBoolean(value))
    @IsBoolean()
    @IsOptional()
    readonly blacklist: boolean

    @Transform(({value}) => toBoolean(value))
    @IsBoolean()
    @IsOptional()
    readonly blacklistedBy: boolean

    @Transform(({value}) => toBoolean(value))
    @IsBoolean()
    @IsOptional()
    readonly matchHistory: boolean

    @Transform(({value}) => toBoolean(value))
    @IsBoolean()
    @IsOptional()
    readonly playStats: boolean

    @Transform(({value}) => toBoolean(value))
    @IsBoolean()
    @IsOptional()
    readonly channels: boolean

    @Transform(({value}) => toBoolean(value))
    @IsBoolean()
    @IsOptional()
    readonly messages: boolean
}

export class UserSelectQueryDto
{
    @Transform(({value}) => toBoolean(value))
    @IsBoolean()
    @IsOptional()
    readonly id: boolean;

    @Transform(({value}) => toBoolean(value))
    @IsBoolean()
    @IsOptional()
    readonly id42: boolean;

    @Transform(({value}) => toBoolean(value))
    @IsBoolean()
    @IsOptional()
    readonly userName: boolean;

    @Transform(({value}) => toBoolean(value))
    @IsBoolean()
    @IsOptional()
    readonly email: boolean;

    @Transform(({value}) => toBoolean(value))
    @IsBoolean()
    @IsOptional()
    readonly createdAt: boolean;

    @Transform(({value}) => toBoolean(value))
    @IsBoolean()
    @IsOptional()
    readonly status: boolean;
}