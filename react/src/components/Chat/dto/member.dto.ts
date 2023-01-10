import { SharedChannelMembersDto } from "../../../../shared/dtos";
import { Channel } from "../../../dto/channels.dto";

export interface Member extends SharedChannelMembersDto { }

export interface ContextMenuData {
	x: number;
	y: number;
	userName: string;
	targetId: string;
	channel: Channel
}
