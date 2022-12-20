import { RoleType } from "@prisma/client";
import { IsOptional, IsString } from "class-validator";

export class ChannelMemberDto //implements SharedChannelMemberDto
{
	@IsOptional()
	@IsString()
	channelId:	string
	
	@IsOptional()
	@IsString()
	userId:	string

	@IsOptional()
	@IsString()
	role: RoleType
}