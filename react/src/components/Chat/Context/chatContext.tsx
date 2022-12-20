import { createContext, useContext } from "react";
import { Socket } from "socket.io-client";
import { SharedChannelDto } from "../../../../shared/dtos";
import { Channel, PartialChannel } from "../../../dto/channels.dto";
import { PartialUser, User } from "../../../dto/users.dto";
import { defaultUser } from "../../Socket/socket-context";

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

type TChatContextActions = 'update_channels' | 'update_socket' | 'new_channel' | 'update_active';

type TChatContextPayload = Socket | PartialUser | PartialChannel[] | Channel | undefined;

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

export function ChatReducer(state: IChatContextState, action: IChatContextActions)
{
	console.info('CHAT REDUCER');
	console.info(`Message received - Action: ${action.type} - Payload: ${action.payload}`);

	switch(action.type)
	{
		case 'update_channels':
			console.info('Updating channels', action.payload);
			return {...state, visibleChannels: action.payload as Channel[]};
		case 'update_socket':
			console.info('Updating socket', action.payload);
			return {...state, socket: action.payload as Socket};
		case 'new_channel':
		{
			const newChannels = newChannel(state.visibleChannels, action.payload as Channel);
			return {...state, visibleChannels: newChannels};
		}
		case 'update_active':
			return {...state, activeChannel: action.payload as Channel}
		default:
			return {...state};
	}
}

export interface IChatContextProps
{
	ChatState: IChatContextState;
	ChatDispatch: React.Dispatch<IChatContextActions>;
	// user: User | undefined;
}

const ChatContext = createContext<IChatContextProps>(
	{
		ChatState: defaultChatContextState,
		ChatDispatch: () => {},
		// user: undefined,
	});

export const ChatContextProvider = ChatContext.Provider;
export const ChatContextConsumer = ChatContext.Consumer;

export default ChatContext;
