import { useEffect, useState } from "react";
import { User } from "../../../dto/users.dto";
import { backURL } from "../../../requests";
import { ContextMenuData, Member } from "../dto";
import { ContextMenu } from "./ContextMenu";
import { MemberList } from "./MemberList";

export function ChatRightBar({ users }: { users: Member[] })
{
	const onlineMembers: Member[] = users.filter((u) => u.user.status !== 'OFFLINE');
	const offlineMembers: Member[] = users.filter((u) => u.user.status === 'OFFLINE');

	return (
		<div className="bg-zinc-700 w-60 overflow-hidden break-words">
			<MemberList members={onlineMembers} status={'ONLINE'} />
			<MemberList members={offlineMembers} status={'OFFLINE'} />
		</div>
	)
}
