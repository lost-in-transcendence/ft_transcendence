import { SharedCreateChatDto } from "../../../../shared/dtos";

export class CreateChatDto implements SharedCreateChatDto
{
	sender: string;
	channel: string;
	text: string;
}
