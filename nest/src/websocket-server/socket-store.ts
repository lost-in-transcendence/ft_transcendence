import { Logger } from '@nestjs/common';
import { Socket } from 'socket.io';

export class SocketStore
{
	private readonly logger = new Logger(SocketStore.name);
	userSockets = new Map<string, Socket[]>()

	setUserSockets(id: string, socket: Socket)
	{
		let tmp: Socket[] = this.getUserSockets(id);
		if (!tmp)
			this.userSockets.set(id, [socket])
		else
			this.userSockets.set(id, [...tmp, socket]);
	}

	removeUserSocket(id: string, socket: Socket)
	{
		const array = this.getUserSockets(id);
		const newArray = array.filter((v) => v.id !== socket.id);

		this.userSockets.delete(id);
		for (let n of newArray)
			this.setUserSockets(id, n)
		this.userSockets.set(id, newArray);
	}

	getUserSockets(id: string): Socket[]
	{
		const ret = this.userSockets.get(id);
		if (!ret)
			return [];
		else
			return ret;
	}
}
