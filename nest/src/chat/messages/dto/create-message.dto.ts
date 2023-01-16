import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";
import { SharedCreateMessageDto } from 'shared/dtos'

export class CreateMessageDto implements SharedCreateMessageDto
{

	@IsUUID()
	@IsNotEmpty()
	channelId: string;

	@IsString()
	@MaxLength(2000)
	@MinLength(1)
	content: string;
}
