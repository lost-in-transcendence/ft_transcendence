import { useContext, useEffect, useState } from "react";

import { User } from "../../../dto/users.dto";
import { ChatComposer } from "../ChatComposer/ChatComposer";
import { ChatWindow } from "../ChatWindow/ChatWindow";
import ChatContext from "../Context/chatContext";
import * as events from "../../../../shared/constants";
import { Member } from "../dto";
import { backURL } from "../../../requests";
import { ChatRightBar } from "../rightBar/ChatRightBar";
import { ContextMenu } from "../rightBar/ContextMenu";

import SocketContext from "../../Socket/socket-context";

export function ChatDisplay({ currentUser }: { currentUser: User }) {
  const ctx = useContext(ChatContext);
  const mainCtx = useContext(SocketContext);

  const channel = ctx.ChatState.activeChannel;
  const socket = ctx.ChatState.socket;

  const mainSocket = mainCtx.SocketState.socket;
  const blackList = mainCtx.SocketState.user.blacklist;

  const [users, setUsers] = useState<Member[]>([]);

  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [display, setDisplay] = useState(false);

  function updateUserInfo(id: string, data: any) {
    console.log("updating", id, "with", data);
    setUsers((prev) => {
      const index = prev.findIndex((v) => {
        return v.user.id === id;
      });
      if (index === -1) return prev;
      const updated = prev.map((v, i) => {
        if (i !== index) return v;
        const updatedUser = { ...v.user };
        Object.assign(updatedUser, data);
        return { ...v, user: updatedUser };
      });
      return updated;
    });
  }

  useEffect(() => {
    console.log("in chatDisplay useEffect");
    socket?.on(events.USERS, (payload: Member[]) => {
      console.log({ payload });
      setUsers(payload);
    });

    socket?.on("updateUser", (payload: any) => {
      const { id, data } = payload;
      updateUserInfo(id, data);
    });
    // socket?.on(events.ALERT, (payload: { event: string, args?: string }) =>
    // {
    // 	if (payload.event === events.USERS)
    // 		socket.emit(events.USERS, { channelId: channel?.id });
    // })

    socket?.emit(events.USERS, { channelId: channel?.id });
    return () => {
      socket?.off(events.USERS);
    };
  }, []);

  useEffect(() => {
    socket?.emit(events.USERS, { channelId: channel?.id });
  }, [channel]);

  function blockUser(userId: string) {
    mainSocket?.emit(events.BLOCK_USER, { userId });
  }

  function unblockUser(userId: string) {
    mainSocket?.emit(events.UNBLOCK_USER, { userId });
  }

  useEffect(() => {
    const handleClick = () => setDisplay(false);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  return (
    <div className="flex flex-row bg-slate-500 h-screen">
      <div className="flex flex-col basis-full overflow-x-hidden">
        <ChatWindow
          users={users}
          className="bg-slate-400 basis-full overflow-y-auto px-1 py-2"
        />
        <ChatComposer className="justify-self-end" user={currentUser} />
      </div>
      {<ChatRightBar users={users} />}
    </div>
  );
}
