import { MenuItem } from "./MenuItem";

export function Dropdown(props: {submenus: any, dropdown: boolean, depthLevel: number})
{
    let {submenus, dropdown, depthLevel} = props;
    depthLevel += 1;
    const dropdownClass = depthLevel > 1 ? "dropdown-submenu" : "";
    return(
        <ul className={`dropdown ${dropdownClass} ${dropdown ? "show" : ""}`}>
            {submenus.map((submenu: any, index: any) =>
            {
                return (
                <li key={index} className="menu-items">
                    <MenuItem items={submenu} key={index} depthLevel={depthLevel}/>
                </li>
                );
            })}
        </ul>
    );
}