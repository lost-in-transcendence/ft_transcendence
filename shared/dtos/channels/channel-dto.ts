export class SharedChannelDto
{
	id: string;
	channelName: string;
	mode: string;
	hash?: string;
	createdAt: Date;
	members?: ChannelMembersDto[];
}

export class SharedFindUniqueChannelDto
{
	id: string;
	channelName: string;
}

class ChannelMembersDto
{
	user:
	{
		id: string;
		userName: string;
		status: string;
	}
}
