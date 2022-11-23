import { ChannelMember, Message, ChannelModeType, Prisma, Channel } from "@prisma/client";
import { IsArray, IsDate, IsEnum, isNotEmpty, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateIf } from "class-validator";
import { Exclude } from 'class-transformer'

export class ChannelDto implements Channel
{
	@IsUUID()
	id: string;

	@IsOptional()
	@IsString()
	channelName: string;

	@IsEnum(ChannelModeType)
	mode: ChannelModeType;

	@IsString()
	@IsOptional()
	hash: string;

	@IsUUID()
	@IsNotEmpty()
	ownerId: string;

	@IsDate()
	createdAt: Date;
}

export class FindUniqueChannelDto
{
	@IsUUID()
	@IsOptional()
	id: string;

	@IsString()
	@IsOptional()
	channelName: string;
}
