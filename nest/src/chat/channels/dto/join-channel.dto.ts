import { RoleType } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";
import { SharedJoinChannelMessageDto } from "shared/dtos";

export class joinChannelDto
{
	@IsNotEmpty()
	@IsUUID()
	userId:	string;

	@IsNotEmpty()
	@IsUUID()
	channelId: string;

	@IsNotEmpty()
	@IsEnum(RoleType)
	role:	RoleType;
}

export class joinChannelMessageDto implements SharedJoinChannelMessageDto
{
	@IsNotEmpty()
	@IsUUID()
	channelId: string;

	@IsOptional()
	@IsString()
	password?: string;
}
