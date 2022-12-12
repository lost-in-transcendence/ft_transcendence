import { menuItems } from "./constants";
import { MenuAvatar } from "./MenuAvatar";
import { MenuItem } from "./MenuItem";

export function Navbar()
{
    return (
        <nav>
            <ul className="menus">
                {menuItems.map((menu, index) =>
                {
                    const depthLevel =0;
                    return <MenuItem items={menu} key={index} depthLevel={depthLevel} />
                })}
                {/* <MenuAvatar /> */}
            </ul>
        </nav>
    )
}