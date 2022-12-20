export interface SharedChannelDto
{
	id: string;
	channelName: string;
	mode: string;
	hash?: string;
	createdAt: Date;
	members?: ChannelMembersDto[];
}

export interface SharedFindUniqueChannelDto
{
	id: string;
	channelName: string;
}

interface ChannelMembersDto
{
	user:
	{
		id: string;
		userName: string;
		status: string;
	}
}

export interface SharedPartialChannelDto
{
	id?: string;
	channelName?: string;
	mode?: string;
	hash?: string;
	createdAt?: Date;
	members?: ChannelMembersDto[];
}
