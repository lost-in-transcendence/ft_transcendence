import { RoleType } from "@prisma/client";
import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

import { SharedBanUserDto } from "shared/dtos";

export interface BanMemberDto extends SharedBanUserDto { }

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
