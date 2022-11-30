export class SharedChannelDto
{
	id: string;
	channelName: string;
	mode: string;
	hash?: string;
	createdAt: Date;
}

export class SharedFindUniqueChannelDto
{
	id: string;
	channelName: string;
}
