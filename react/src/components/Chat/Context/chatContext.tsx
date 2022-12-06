import { createContext, useContext } from "react";
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
	visibleChans: ChatChannelDto[];
}

export const ChatContext = createContext<ChatContextType>({user: undefined, visibleChans: []});
