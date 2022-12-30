import { Logger } from "@nestjs/common";
import { map } from "rxjs";
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
		//console.log(this.getUserSockets(id))
  	}

	static removeUserSocket(id: string, socket: Socket)
	{
		const array = this.getUserSockets(id);
		const index = array.indexOf(socket);
		const newArray = array.splice(index,  1);

		this.userSockets.delete(id);
		for (let n of newArray)
			this.setUserSockets(id, n)
	}

	static getUserSockets(id: string): Socket[]
	{
		return (this.userSockets.get(id));
	}
}