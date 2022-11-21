import { ChannelModeType } from '@prisma/client';
import { PartialType } from '@nestjs/mapped-types';

import { CreateChannelDto } from './create-channel.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateChannelDto extends PartialType(CreateChannelDto)
{
	@IsEnum(ChannelModeType)
	@IsOptional()
	mode: ChannelModeType;

	@IsString()
	@IsOptional()
	password: string;
}
