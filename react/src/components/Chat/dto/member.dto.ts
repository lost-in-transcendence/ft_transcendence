import { SharedChannelMembersDto } from "../../../../shared/dtos";

export interface Member extends SharedChannelMembersDto {}

export interface ContextMenuData
{
	x: number;
	y: number;
	userName: string;
	targetId: string;
}
