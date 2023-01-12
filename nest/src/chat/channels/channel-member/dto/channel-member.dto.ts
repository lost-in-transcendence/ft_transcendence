import { RoleType } from "@prisma/client";
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";

import { SharedBanUserDto } from "shared/dtos";

export class BanMemberDto implements SharedBanUserDto
{
	@IsUUID()
	@IsNotEmpty()
	userId: string;

	@IsUUID()
	@IsNotEmpty()
	channelId: string;

	@IsNumber()
	@IsNotEmpty()
	banTime: number;

	@IsString()
	@IsNotEmpty()
	userName: string;
}

export class ChannelMemberDto //implements SharedChannelMemberDto
{
	@IsOptional()
	@IsString()
	channelId?: string

	@IsOptional()
	@IsString()
	userId?: string

	@IsOptional()
	@IsString()
	role?: RoleType
}

export class UpdateChannelMemberDto
{
	@IsNotEmpty()
	@IsUUID()
	channelId: string;

	@IsNotEmpty()
	@IsUUID()
	userId: string;
}
