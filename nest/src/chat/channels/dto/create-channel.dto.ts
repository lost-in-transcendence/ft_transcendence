import { ChannelModeType, Prisma } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

import { SharedCreateChannelDto } from "../../../../../shared/dtos";

export class CreateChannelDto implements SharedCreateChannelDto
{
	@IsOptional()
	@IsString()
	channelName?: string;

	@IsEnum(ChannelModeType)
	@IsNotEmpty()
	mode: ChannelModeType;

	@IsOptional()
	@IsString()
	password: string;
}
