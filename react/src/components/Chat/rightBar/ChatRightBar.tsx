import { useContext, useEffect, useState } from "react";
import { Channel } from "../../../dto/channels.dto";
import { User } from "../../../dto/users.dto";
import { backURL } from "../../../requests";
import { ContextMenuData, Member } from "../dto";
import { ContextMenu } from "../ContextMenu/ContextMenu";
import { MemberList } from "./MemberList";
import ChatContext from "../Context/chatContext";

export function ChatRightBar()
{
	const channel = useContext(ChatContext).ChatState.activeChannel;
	if (!channel)
		return <></>
	const users = channel.members;
	const onlineMembers: Member[] = users.filter((u) => u.user.status !== 'OFFLINE' && u.role !== "INVITED");
	const offlineMembers: Member[] = users.filter((u) => u.user.status === 'OFFLINE' && u.role !== "INVITED");

	return (
		<div className="bg-zinc-700 w-60 overflow-auto break-words">
			<MemberList members={onlineMembers} status={'ONLINE'} channel={channel}/>
			<MemberList members={offlineMembers} status={'OFFLINE'} channel={channel}/>
		</div>
	)
}
