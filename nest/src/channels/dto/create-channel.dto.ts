import { ChannelModeType } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateChannelDto
{
	@IsOptional()
	@IsString()
	channelName?: 	string;

	@IsEnum(ChannelModeType)
	@IsNotEmpty()
	mode:			ChannelModeType;

	@IsOptional()
	@IsString()
	password:		string;

	@IsUUID()
	@IsNotEmpty()
	ownerId:		string;
}
