import { Logger } from '@nestjs/common';
import { Socket} from 'socket.io';

export class SocketStore
{
	private readonly logger = new Logger(SocketStore.name);
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
		const newArray = array.filter((v) => v.id !== socket.id);
<<<<<<< HEAD

		this.userSockets.delete(id);
		for (let n of newArray)
			this.setUserSockets(id, n)
=======
		this.userSockets.set(id, newArray);
>>>>>>> 4fca00844b715674b56d9e51c3a8a934e3e998df
	}

	getUserSockets(id: string): Socket[]
	{
		return (this.userSockets.get(id));
	}
}