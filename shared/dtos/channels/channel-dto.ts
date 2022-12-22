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
	};
	role: RoleType
}

enum RoleType {
    OWNER = "OWNER",
    ADMIN = "ADMIN",
    MEMBER = "MEMBER",
    MUTED = "MUTED",
    BANNED = "BANNED"
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
