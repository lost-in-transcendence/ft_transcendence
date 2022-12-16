import { Socket } from "socket.io-client";
import React, { createContext } from "react";

export interface IGameSocketContextState
{
    socket: Socket | undefined;
}

export const defaultGameSocketContextState =
{
    socket: undefined
}

export type TGameSocketContextActions = "update_socket";

export type TGameSocketContextPayload = Socket;

export interface IGameSocketContextActions
{
    type: TGameSocketContextActions;
    payload: TGameSocketContextPayload;
}

export function GameSocketReducer(state: IGameSocketContextState, action: IGameSocketContextActions)
{
    // console.info(`Message Received - Action: ${action.type} - Payload `, action.payload)

	switch (action.type)
	{
		case 'update_socket':
			return {...state, socket: action.payload as Socket};
		default:
			return { ...state };
	}
}

export interface IGameSocketContextProps
{
    GameSocketState: IGameSocketContextState;
    GameSocketDispatch: React.Dispatch<IGameSocketContextActions>
}

const GameSocketContext = createContext<IGameSocketContextProps>(
    {
        GameSocketState: defaultGameSocketContextState,
        GameSocketDispatch: () => {}
    }
)

export const GameSocketContextConsumer = GameSocketContext.Consumer;
export const GameSocketContextProvider = GameSocketContext.Provider;

export default GameSocketContext;