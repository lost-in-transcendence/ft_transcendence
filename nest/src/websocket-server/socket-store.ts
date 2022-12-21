import { Logger } from '@nestjs/common';
import { Socket} from 'socket.io';

export class SocketStore
{
	userSockets = new Map()

	setUserSockets(id: string, socket: Socket) 
	{
		let tmp: Socket[] = this.getUserSockets(id);
		if (!tmp)
			this.userSockets.set(id, [socket])
		else
			this.userSockets.set(id, [...tmp, socket]);
		//console.log(this.getUserSockets(id))
  	}

	removeUserSocket(id: string, socket: Socket)
	{
		const array = this.getUserSockets(id);
		const index = array.indexOf(socket);
		const newArray = array.splice(index,  1);

		this.userSockets.delete(id);
		for (let n of newArray)
			this.setUserSockets(id, n)
	}

	getUserSockets(id: string): Socket[]
	{
		return (this.userSockets.get(id));
	}
}