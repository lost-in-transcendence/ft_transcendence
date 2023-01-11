import React, { createContext } from "react";

export interface IContextMenuData
{
    x: number;
    y: number;
    userName: string;
    targetId: string;
}

export interface IContextMenuState
{
    data: IContextMenuData | undefined;
}

export const defaultContextMenuData: IContextMenuData | undefined = undefined;

export type TContextMenuActions = 'update';

export type TContextMenuPayload = IContextMenuData | undefined;

export interface IContextMenuActions
{
    type: TContextMenuActions;
    payload: TContextMenuPayload;
}

export function ContextMenuReducer(state: IContextMenuState, action: IContextMenuActions)
{
    switch (action.type)
    {
        case 'update':
            return {...state, data: action.payload as IContextMenuData | undefined};
        default:
            return {...state};
    }
}

export interface IContextMenuProps
{
    ContextMenuState: IContextMenuState ;
    ContextMenuDispatch: React.Dispatch<IContextMenuActions>
}

const ContextMenuContext = createContext<IContextMenuProps>(
    {
        ContextMenuState: {data: defaultContextMenuData},
        ContextMenuDispatch: () => {},
    }
);

export const ContextMenuConsumer = ContextMenuContext.Consumer;
export const ContextMenuProvider = ContextMenuContext.Provider;

export default ContextMenuContext;