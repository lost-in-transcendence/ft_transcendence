import { ChannelModeType } from '@prisma/client';
import { PartialType } from '@nestjs/mapped-types';

import { CreateChannelDto } from './create-channel.dto';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateChannelDto extends PartialType(CreateChannelDto)
{
	@IsUUID()
	@IsNotEmpty()
	channelId: string;

	@IsString()
	@IsOptional()
	channelName?: string;

	@IsEnum(ChannelModeType)
	@IsOptional()
	mode?: ChannelModeType;

	@IsString()
	@IsOptional()
	password?: string;
}
