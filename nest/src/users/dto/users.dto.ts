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
    readonly id42: number

    @IsString()
    @IsNotEmpty()
    readonly email: string

    @IsString()
    @IsNotEmpty()
    readonly avatar: string
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
    // console.log(value);
    // console.log(typeof value);
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
    readonly friends

    @Transform(({value}) => toBoolean(value))
    @IsBoolean()
    @IsOptional()
    readonly friendTo

    @Transform(({value}) => toBoolean(value))
    @IsBoolean()
    @IsOptional()
    readonly blacklist

    @Transform(({value}) => toBoolean(value))
    @IsBoolean()
    @IsOptional()
    readonly blacklistedBy

    @Transform(({value}) => toBoolean(value))
    @IsBoolean()
    @IsOptional()
    readonly matchHistory

    @Transform(({value}) => toBoolean(value))
    @IsBoolean()
    @IsOptional()
    readonly playStats

    @Transform(({value}) => toBoolean(value))
    @IsBoolean()
    @IsOptional()
    readonly channels

    @Transform(({value}) => toBoolean(value))
    @IsBoolean()
    @IsOptional()
    readonly messages
}