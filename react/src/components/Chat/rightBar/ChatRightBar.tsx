import { useEffect, useState } from "react";
import { User } from "../../../dto/users.dto";
import { backURL } from "../../../requests";
import { Member } from "../dto";
import { ContextMenu } from "./ContextMenu";

interface ContextMenuData {
  x: number;
  y: number;
  userName: string;
}

export function ChatRightBar({ users }: { users: any[] }) {
  const [display, setDisplay] = useState<ContextMenuData | undefined>(
    undefined
  );

  useEffect(() => {
    const handleClick = () => setDisplay(undefined);
    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <div className="bg-zinc-700 w-60 overflow-hidden break-words">
      {display && (
        <ContextMenu x={display.x} y={display.y} userName={display.userName} />
      )}
      <h3 className={"ml-2 mt-2 text-zinc-400"}>ONLINE</h3>
      <ul>
        {users.map((u: Member, i) => {
          const user = u.user;
          if (user.status === "ONLINE")
            return (
              <div key={i}>
                <span
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setDisplay({
                      x: e.pageX,
                      y: e.pageY,
                      userName: user.userName,
                    });
                  }}
                  className="flex rounded items-center ml-2 mr-2 hover:bg-zinc-400 cursor-pointer"
                >
                  )
                  <img
                    className="float-left rounded-full h-10 w-10 inline mt-3 mb-2 mr-2"
                    src={`${backURL}/users/avatars/${
                      user.userName
                    }?time=${Date.now()}`}
                  />
                  <div className="flex flex-col justify-center items-center">
                    <span> {user.userName} </span>
                    <span>{u.role}</span>
                    {/* <span>{user.gameStatus}</span> */}
                    <br />
                    <br />
                  </div>
                </span>
              </div>
            );
        })}
      </ul>
      <h3 className={"ml-2 mt-2 text-zinc-400"}>OFFLINE</h3>
      <ul>
        {users.map((u: Member, i) => {
          const user = u.user;
          if (user.status === "OFFLINE")
            return (
              <div key={i}>
                <span
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setDisplay({
                      x: e.pageX,
                      y: e.pageY,
                      userName: user.userName,
                    });
                  }}
                  className="flex rounded items-center ml-2 mr-2 hover:bg-zinc-400 cursor-pointer"
                >
                  )
                  <img
                    className="float-left rounded-full h-10 w-10 inline mt-3 mb-2 mr-2"
                    src={`${backURL}/users/avatars/${
                      user.userName
                    }?time=${Date.now()}`}
                  />
                  <div className="flex flex-col justify-center items-center">
                    <span> {user.userName} </span>
                    <span>{u.role}</span>
                    {/* <span>{user.gameStatus}</span> */}
                    <br />
                    <br />
                  </div>
                </span>
              </div>
            );
        })}
      </ul>
    </div>
  );
}
