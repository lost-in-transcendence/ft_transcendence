export class SharedChannelDto
{
	id: string;
	channelName: string;
	mode: string;
	hash: string;
	ownerId: string;
	createdAt: Date;
}

export class SharedFindUniqueChannelDto
{
	id: string;
	channelName: string;
}
