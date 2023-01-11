import { SharedFullUserDto, SharedOtherUserDto, SharedPartialOtherUserDto, SharedPartialUserDto } from "../../shared/dtos";

export interface User extends SharedFullUserDto
{
}

export interface PartialUser extends SharedPartialUserDto
{
}

export interface OtherUser extends SharedOtherUserDto
{
}

export interface PartialOtherUser extends SharedPartialOtherUserDto
{
}