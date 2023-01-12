import { Logger } from "@nestjs/common";
import { Socket } from 'socket.io';

export class UserSocketStore
{
	private static readonly logger = new Logger(UserSocketStore.name);
	static userSockets = new Map()

	static setUserSockets(id: string, socket: Socket) 
	{
		this.logger.debug("hellooo");
		let tmp: Socket[] = this.getUserSockets(id);
		if (!tmp)
			this.userSockets.set(id, [socket])
		else
			this.userSockets.set(id, [...tmp, socket]);
  	}

	static removeUserSocket(id: string, socket: Socket)
	{
		const array = this.getUserSockets(id);
		const newArray = array.filter((v) => v.id !== socket.id);

		this.userSockets.set(id, newArray);
	}

	static getUserSockets(id: string): Socket[]
	{
		const ret = this.userSockets.get(id);
		if (!ret)
			return []
		else
			return ret;
	}
}