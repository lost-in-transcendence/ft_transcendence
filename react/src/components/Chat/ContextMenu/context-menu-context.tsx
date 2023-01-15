import React, { createContext, ReactNode, useState } from "react";
import { SharedGameStatusDto, SharedUserStatus } from "../../../../shared/dtos";
import { ContextMenuData } from "../dto";

export interface IContextMenuProps
{
    ContextMenuState: ContextMenuData | undefined ;
    ContextMenuSetter: React.Dispatch<React.SetStateAction<ContextMenuData | undefined>>
}

const ContextMenuContext = createContext<IContextMenuProps>(
    {
        ContextMenuState: undefined,
        ContextMenuSetter: () => {},
    }
);

export const ContextMenuConsumer = ContextMenuContext.Consumer;
export const ContextMenuProvider = ContextMenuContext.Provider;

export default ContextMenuContext;
