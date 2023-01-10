import { SharedBanUserDto, SharedChannelMembersDto } from "../../../../shared/dtos";
import { Channel } from "../../../dto/channels.dto";

export interface Member extends SharedChannelMembersDto { }
export interface BanMemberDto extends SharedBanUserDto { }

export interface ContextMenuData {
	x: number;
	y: number;
	channel: Channel;
	target: Member;
}
