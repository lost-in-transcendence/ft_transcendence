export interface SharedChannelDto
{
	id: string;
	channelName: string;
	mode: string;
	hash?: string;
	createdAt: Date;
	members?: SharedChannelMembersDto[] | any[];
}

export interface SharedFindUniqueChannelDto
{
	id: string;
	channelName: string;
}

export interface SharedChannelMembersDto
{
	user:
	{
		id: string;
		userName: string;
		status: string;
	};
	role: RoleType;
	avatarPath?: string;
	timeJoined?: Date;
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
	members?: SharedChannelMembersDto[];
}
