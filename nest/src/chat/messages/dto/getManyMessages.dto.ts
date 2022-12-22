import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { SharedGetManyMessagesDto } from "shared/dtos";

export class getManyMessageDto implements SharedGetManyMessagesDto
{
	@IsString()
	@IsNotEmpty()
	channelId: string;

	@IsNumber()
	@IsNotEmpty()
	amount: number;
}
