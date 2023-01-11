import { Action } from "@remix-run/router";
import React, { createContext } from "react";
import { Socket } from "socket.io-client";
import { SharedGameStatusDto, SharedUserStatus } from "../../../shared/dtos";
import { GameStatus } from "../../dto/game.dto";
import { PartialUser, User } from "../../dto/users.dto";



export interface ISocketContextState
{
	socket: Socket | undefined;
	user: User;
}

export const defaultUser: User =
{
	id: '',
	id42: 0,
	userName: '',
	email: '',
	avatarPath: '',
	twoFaEnabled: false,
	friends: [],
	blacklist: [],
	status: SharedUserStatus.OFFLINE,
	gameStatus: SharedGameStatusDto.NONE,
	playStats: undefined,
	channels: [],

}

export const defaultSocketContextState: ISocketContextState =
{
	socket: undefined,
	user: defaultUser
}

export type TSocketContextActions = 'update_socket' | 'update_user'

export type TSocketContextPayload =  Socket | PartialUser;

export interface ISocketContextActions
{
	type: TSocketContextActions;
	payload: TSocketContextPayload;
}

function updateUser(user: User, payload: PartialUser)
{
	const newUser = { ...user };
	Object.assign(newUser, payload);
	return (newUser);
}

export function SocketReducer(state: ISocketContextState, action: ISocketContextActions)
{
	// console.info(`Message Received - Action: ${action.type} - Payload `, action.payload)

	switch (action.type)
	{
		case 'update_socket':
			return {...state, socket: action.payload as Socket};
		case 'update_user':
			{
				const newUser = updateUser(state.user, action.payload);
				return {...state, user: newUser as User};
			}
		default:
			return { ...state };
	}
}

export interface ISocketContextProps
{
	SocketState: ISocketContextState;
	SocketDispatch: React.Dispatch<ISocketContextActions>;
}

const SocketContext = createContext<ISocketContextProps>(
	{
		SocketState: defaultSocketContextState,
		SocketDispatch: () => {}
	}
);

export const SocketContextConsumer = SocketContext.Consumer;
export const SocketContextProvider = SocketContext.Provider;

export default SocketContext;
