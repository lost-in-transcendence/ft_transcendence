import { SharedGameStatusDto } from "../game";
import { SharedUserStatus } from "../users";

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
		status: SharedUserStatus | any;
		gameStatus: SharedGameStatusDto | any;
	};
	role: RoleType | any;
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
