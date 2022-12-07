import { createContext, useContext } from "react";
import { Socket } from "socket.io-client";
import { SharedChannelDto } from "../../../../shared/dtos";

export type ChatChannelDto =
{
	id: string;
	channelName: string;
	mode: string;
	hash?: string;
	createdAt: Date;
	members: ChannelMembersDto[];
}

type ChannelMembersDto =
{
	user:
	{
		id: string;
		userName: string;
		status: string;
	}
}


type ChatContextType =
{
	user: any;
	socket: Socket | undefined;
	joined: ChatChannelDto[];
	joinable: ChatChannelDto[];
	visible: ChatChannelDto[];
}

export const ChatContext = createContext<ChatContextType>({
	joinable: [],
	joined: [],
	visible: [],
	user: undefined,
	socket: undefined,
});
