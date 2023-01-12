import { SharedBanUserDto, SharedChannelMembersDto, SharedGameStatusDto, SharedUserStatus } from "../../../../shared/dtos";
import { Channel } from "../../../dto/channels.dto";
import { User } from "../../../dto/users.dto";

export interface Member extends SharedChannelMembersDto { }
export interface BanMemberDto extends SharedBanUserDto { }

export interface PartialUser
{
	id: string;
	userName: string;
	status: SharedUserStatus | any;
	gameStatus: SharedGameStatusDto | any;
}

export interface ContextMenuData {
	x: number;
	y: number;
	channel: Channel | undefined;
	target: PartialUser;
}
