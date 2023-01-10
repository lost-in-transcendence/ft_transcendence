import { RoleType } from "@prisma/client";
import { IsOptional, IsString } from "class-validator";

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