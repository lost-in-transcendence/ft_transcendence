import { SharedGameStatusDto } from "../game";

export class SharedUpdateUserDto
{
    readonly userName?: string

	readonly email?: string
}

export interface SharedUpdateFriendsDto {
	readonly userId: string
}

export enum SharedUserStatus {
	ONLINE = 'ONLINE',
	OFFLINE = 'OFFLINE',
	BUSY = 'BUSY',
	AWAY = 'AWAY',
	INVISIBLE = 'INVISIBLE',
	TA_GRAND_MERE = 'TA_GRAND_MERE',
}

export interface SharedPlayStatsDto
{
    user: SharedPartialUserDto,
	userId: string,
	wins: number,
	losses: number,
	points: number,
	rank: number,
	achievement_points: number,
}

export interface SharedOtherUserDto {
	id: string;
	id42: string;
	userName: string;
	email: string;
	avatarPath?: string;
	isGuest: boolean;
	status: SharedUserStatus;
	gameStatus: SharedGameStatusDto;
	playStats: SharedPlayStatsDto;
}

export interface SharedPartialOtherUserDto
{
	id?: string;
	id42?: string;
	userName?: string;
	email?: string;
	avatarPath?: string;
	isGuest?: boolean;
	status?: SharedUserStatus;
	gameStatus?: SharedGameStatusDto;
	playStats?: SharedPlayStatsDto;
}

export interface SharedBanUserDto {
	userId: string;
	channelId: string;
	banTime: number;
	userName: string;
}

export interface SharedKickUserDto
{
	userId: string;
	channelId: string;
	userName: string;
}

export enum SharedChannelMode {
	PUBLIC = 'PUBLIC',
	PRIVATE = 'PRIVATE',
	PROTECTED = 'PROTECTED',
	PRIVMSG = 'PRIVMSG'
}

interface SharedChannelDto2 {
	channelName: string;
	mode: SharedChannelMode;
}

export enum SharedChannelRole {
	OWNER = 'OWNER',
	ADMIN = 'ADMIN',
	MEMBER = 'MEMBER',
	MUTED = 'MUTED',
	BANNED = 'BANNED'
}


export interface SharedJoinedChannelsDto {
	channelId: string;
	role: SharedChannelRole;
	banExpires?: Date;
	muteExpires?: Date;
	channel: SharedChannelDto2;
}

export interface SharedFullUserDto {
	id: string;
	id42: string;
	userName: string;
	email: string;
	avatarPath?: string;

	isGuest: boolean;

	twoFaEnabled : boolean;

	friends?: SharedOtherUserDto[];
	blacklist?: SharedOtherUserDto[];

	status: SharedUserStatus;
	gameStatus: SharedGameStatusDto;
	playStats?: SharedPlayStatsDto;
	channels: SharedJoinedChannelsDto[];
}

export interface SharedPartialUserDto {
	id?: string;
	id42?: string;
	userName?: string;
	email?: string;
	avatarPath?: string;
	
	isGuest?: boolean;

	twoFaEnabled? : boolean;

	friends?: SharedOtherUserDto[];
	blacklist?: SharedOtherUserDto[];

	status?: SharedUserStatus;
	gameStatus?: SharedGameStatusDto;
	playStats?: SharedPlayStatsDto;
	channels?: SharedJoinedChannelsDto[];
}
