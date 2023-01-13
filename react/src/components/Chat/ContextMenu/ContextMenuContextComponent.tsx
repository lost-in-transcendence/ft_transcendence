import { ReactNode, useState } from "react";
import { ContextMenuData } from "../dto";
import { ContextMenuProvider } from "./context-menu-context";

export function ContextMenuContextComponent({children}: {children: ReactNode})
{
    const [contextMenu, setContextMenu] = useState<ContextMenuData | undefined>(undefined);

    return (
        <ContextMenuProvider value={{ContextMenuState: contextMenu, ContextMenuSetter: setContextMenu}}>
            {children}
        </ContextMenuProvider>
    )
}