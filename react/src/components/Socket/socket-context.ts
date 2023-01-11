import { Action } from "@remix-run/router";
import React, { createContext } from "react";
import { Socket } from "socket.io-client";
import { SharedUserStatus } from "../../../shared/dtos";
import { OtherUser, PartialOtherUser, PartialUser, User } from "../../dto/users.dto";

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
	playStats: undefined,
	channels: [],

}

export const defaultSocketContextState: ISocketContextState =
{
	socket: undefined,
	user: defaultUser
}

export type TSocketContextActions = 'update_socket' | 'update_user' | 'update_friend'

export type TSocketContextPayload =  Socket | PartialUser | PartialOtherUser;

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

function updateFriends(user: User, payload: PartialOtherUser)
{
	const {id, ...data} = payload;
	const updatedUser = {...user}
	const {friends} = updatedUser;
	
	const index = updatedUser.friends?.findIndex((v) =>
	{
		return v.id === id;
	});
	if (index === -1)
		return user;
	updatedUser.friends = updatedUser.friends?.map((v: OtherUser, i: number) =>
	{
        if (i !== index)
			return v;
        const updatedFriend = { ...v };
        Object.assign(updatedFriend, data);
        return updatedFriend;
    });
	return updatedUser;
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
		case 'update_friend':
			{
				const updatedFriendsUser = updateFriends(state.user, action.payload);
				return {...state, user: updatedFriendsUser as User};
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
