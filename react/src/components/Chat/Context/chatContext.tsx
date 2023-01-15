import { createContext, useContext } from "react";
import { Socket } from "socket.io-client";
import { SharedChannelDto } from "../../../../shared/dtos";
import { Channel, PartialChannel } from "../../../dto/channels.dto";
import { PartialUser, User } from "../../../dto/users.dto";
import { defaultUser } from "../../Socket/socket-context";
import { Member } from "../dto";

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

// type ChatContextType =
// {
// 	user: any;
// 	socket: Socket | undefined;
// 	joined: ChatChannelDto[];
// 	joinable: ChatChannelDto[];
// 	visible: ChatChannelDto[];
// }

interface IChatContextState
{
	socket: Socket | undefined;
	visibleChannels: Channel[];
	activeChannel: Channel | undefined;
}

export const defaultChatContextState: IChatContextState =
{
	socket: undefined,
	visibleChannels: [],
	activeChannel: undefined,
}

interface IChatUpdateActiveMembers
{
	channelId: string;
	users: Member[]
}

type TChatContextActions = 'update_channels' | 'update_socket' | 'new_channel' | 'update_active' | "update_active_members" | 'update_active_member';

type TChatContextPayload = Socket | PartialUser | PartialChannel[] | Channel | undefined | IChatUpdateActiveMembers;

interface IChatContextActions
{
	type: TChatContextActions;
	payload: TChatContextPayload;
}

function newChannel(current: Channel[], newChannel: Channel): Channel[]
{
	const ret = [...current, newChannel];
	return (ret);
}

function updateActiveMember(members: Member[], member: PartialUser)
{
	const { id, ...data } = member;
	const index = members.findIndex((m) => { return m.user.id === member.id });
	if (index === -1)
		return members;
	return members.map((m, i) =>
	{
		if (i !== index)
			return m;
		const copy = { ...m.user };
		Object.assign(copy, data);
		return { ...m, user: copy };
	});
}

export function ChatReducer(state: IChatContextState, action: IChatContextActions)
{
	switch (action.type)
	{
		case 'update_channels':
			{
				const payload = action.payload as Channel[];
				const updatedChannel = payload.find((c) => c.id === state.activeChannel?.id);
				return { ...state, visibleChannels: action.payload as Channel[], activeChannel: updatedChannel };
			}
		case 'update_socket':
			return { ...state, socket: action.payload as Socket };
		case 'new_channel':
			{
				const newChannels = newChannel(state.visibleChannels, action.payload as Channel);
				return { ...state, visibleChannels: newChannels };
			}
		case 'update_active':
			return { ...state, activeChannel: action.payload as Channel }
		case 'update_active_members':
			{
				if (!state.activeChannel)
					return { ...state };
				const { channelId, users } = action.payload as IChatUpdateActiveMembers;
				if (channelId !== state.activeChannel.id)
					return { ...state };
				return { ...state, activeChannel: { ...state.activeChannel, members: users } }
			}
		case 'update_active_member':
			{
				if (!state.activeChannel || !state.activeChannel.members)
					return { ...state }
				return { ...state, activeChannel: { ...state.activeChannel, members: updateActiveMember(state.activeChannel.members, action.payload as PartialUser) } }
			}
		default:
			return { ...state };
	}
}

export interface IChatContextProps
{
	ChatState: IChatContextState;
	ChatDispatch: React.Dispatch<IChatContextActions>;
}

const ChatContext = createContext<IChatContextProps>(
	{
		ChatState: defaultChatContextState,
		ChatDispatch: () => { },
	});

export const ChatContextProvider = ChatContext.Provider;
export const ChatContextConsumer = ChatContext.Consumer;

export default ChatContext;
