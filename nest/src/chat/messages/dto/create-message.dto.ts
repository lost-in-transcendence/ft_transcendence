import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";

export class CreateMessageDto
{
	@IsUUID()
	@IsNotEmpty()
	userId: string;

	@IsUUID()
	@IsNotEmpty()
	channelId: string;

	@IsString()
	@MaxLength(2000)
	@MinLength(10)
	content: string;
}
