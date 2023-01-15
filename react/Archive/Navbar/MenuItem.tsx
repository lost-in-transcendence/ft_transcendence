import { useState } from "react";
import { Link } from "react-router-dom";
import { Dropdown } from "./Dropdown";

export function MenuItem(props: {items: any, depthLevel: number})
{
    const {items, depthLevel} = props;
    const [dropdown, setDropdown] = useState(false);
    return (
        <li className="menu-items">
            {items.submenus ? (
                <>
                <div onMouseEnter={() => setDropdown(true)} onMouseLeave={() => setDropdown(false)} >
                    <Link to={items.url? items.url : '#'}>
                        <button className={dropdown ? 'hover' : ''}type="button" aria-dropdown={dropdown? 'true' : 'false'} aria-haspopup="menu">
                            {items.title}{' '}
                            {depthLevel > 0 ? <span>&raquo;</span> : <span className="arrow" />}
                        </button>
                    </Link>
                    <Dropdown submenus={items.submenus} dropdown={dropdown} depthLevel={depthLevel}/>
                </div>
                </>
            ) : (
                <Link to={items.url}>{items.title}</Link>
            )}
        </li>
    )
}