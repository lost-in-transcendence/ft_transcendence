import {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { Channel } from "../../../dto/channels.dto";
import ChatContext from "../Context/chatContext";
import { ContextMenuData, Member, MessageDto } from "../dto";
import * as events from "../../../../shared/constants";
import { Socket } from "socket.io-client";
import { flushSync } from "react-dom";
import { backURL } from "../../../requests";
import { ContextMenu } from "../rightBar/ContextMenu";
import { GiConsoleController } from "react-icons/gi";

import SocketContext from "../../Socket/socket-context";

export function ChatWindow({
  className,
  users,
}: {
  users: any[];
  className?: string;
}) {
  const ctx = useContext(ChatContext);
  const mainCtx = useContext(SocketContext);

  const blackList = useContext(SocketContext).SocketState.user.blacklist;
  const mainSocket = mainCtx.SocketState.socket;
  const currentUser = mainCtx.SocketState.user;

  const socket = ctx.ChatState.socket;
  const channel = ctx.ChatState.activeChannel;

  const [visibleMessages, setVisibles] = useState<MessageDto[]>([]);
  const [display, setDisplay] = useState<ContextMenuData | undefined>(
    undefined
  );

  const selfRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    socket?.on(events.GET_MESSAGES, (payload: MessageDto[]) => {
      flushSync(() => {
        setVisibles(payload);
      });
    });

    socket?.on(
      events.NOTIFY,
      (payload: { channelId: string; content: string }) => {
        if (channel && payload.channelId === channel.id) {
          flushSync(() => {
            setVisibles((prev) => {
              const newMessage: MessageDto = {
                channelId: channel.id,
                userId: channel.id,
                content: payload.content,
                createdAt: Date.now(),
                sender: { userName: channel.channelName },
              };
              return [...prev, newMessage];
            });
          });
        }
      }
    );

    mainSocket?.on(events.NOTIFY, (payload: { content: string }) => {
      if (channel) {
        flushSync(() => {
          setVisibles((prev) => {
            const newMessage: MessageDto = {
              channelId: channel.id,
              userId: channel.id,
              content: payload.content,
              createdAt: Date.now(),
              sender: { userName: channel.channelName },
            };
            return [...prev, newMessage];
          });
        });
      }
    });

    socket?.on(events.TO_CHANNEL, (payload: MessageDto) => {
      if (payload.channelId === channel?.id) {
        flushSync(() => {
          setVisibles((prev) => [...prev, payload]);
        });
        selfRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
      }
    });

    socket?.emit(events.GET_MESSAGES, { channelId: channel?.id, amount: 50 });

    return () => {
      socket?.off(events.GET_MESSAGES);
      socket?.off(events.TO_CHANNEL);
      socket?.off(events.NOTIFY);
      mainSocket?.off(events.NOTIFY);
    };
  }, [channel]);

  useEffect(() => {
    selfRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  });

  useEffect(() => {
    const handleClick = () => setDisplay(undefined);
    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, []);

  async function leaveChannel() {
    await socket?.emit(events.LEAVE_CHANNEL, { channelId: channel?.id });
    ctx.ChatDispatch({ type: "update_active", payload: undefined });
  }

  let formatedName: string | undefined;
  if (channel?.mode === "PRIVMSG") {
    const userTo = channel.members?.find(
      (u: Member) => u.user.id !== currentUser?.id
    );
    formatedName = userTo.user.userName;
  } else formatedName = channel?.channelName;

  return (
    <>
      <div
        className="channelTitle
								bg-gray-800 text-zinc-400 text-center text-3xl px-1
								shadow-lg
								flex flex-row items-center justify-center"
      >
        <span className="overflow-hidden basis-full">{formatedName}</span>
        {channel?.mode !== "PRIVMSG" && (
          <button
            className="basis-0 text-gray-800 px-1 bg-red-800 rounded text-sm"
            onClick={leaveChannel}
          >
            Leave
          </button>
        )}
      </div>
      {display && (
        <ContextMenu
          x={display.x}
          y={display.y}
          userName={display.userName}
          targetId={display.targetId}
        />
      )}
      <div className={className}>
        <ul>
          {visibleMessages.map((m, i, all) => {
            let displayName = false;
            let prevUser;
            const prev = all[i - 1];

            if (blackList) {
              if (blackList.find((u) => u.id === m.userId)) return;
            }

            if (prev) prevUser = prev.userId;
            if (prevUser !== m.userId && m.userId !== channel?.id) {
              displayName = true;
            }
            return (
              <li
                key={i}
                ref={i === visibleMessages.length - 1 ? selfRef : null}
                className={`overflow-x-hidden break-words ${
                  m.userId === channel?.id && "text-yellow-500 font-bold"
                }`}
              >
                {displayName && (
                  <div
                    className="hover:bg-slate-600 cursor-pointer rounded px-1"
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setDisplay({
                        x: e.pageX,
                        y: e.pageY,
                        userName: m.sender.userName,
                        targetId: m.userId,
                      });
                    }}
                  >
                    <span>
                      <img
                        className="rounded-full h-14 w-14 inline mt-3 mb-1 mr-2"
                        src={`${backURL}/users/avatars/${
                          m.sender.userName
                        }?time=${Date.now()}`}
                      />
                    </span>
                    <span className="text-red-600 font-semibold">
                      {m.sender.userName}
                    </span>
                    <br />
                  </div>
                )}
                <span className={`${m.userId !== channel?.id && "px-1 mb-2"}`}>
                  {m.content}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
