import { PartialType } from "@nestjs/mapped-types";
import { ChannelModeType, Channel } from "@prisma/client";
import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID} from "class-validator";

import { SharedChannelDto, SharedFindUniqueChannelDto } from "shared/dtos";

export class ChannelDto implements SharedChannelDto
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
	hash?: string;

	@IsDate()
	createdAt: Date;
}

export class FindUniqueChannelDto implements SharedFindUniqueChannelDto
{
	@IsUUID()
	@IsOptional()
	id: string;

	@IsString()
	@IsOptional()
	channelName: string;
}

export class PartialChannelDto extends PartialType(ChannelDto) {}
