export interface SharedMessageDto
{
	userId: string;
	channelId: string;
	content: string;
	createdAt: number;
	sender: { userName: string };
}

