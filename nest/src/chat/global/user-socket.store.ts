import { map } from "rxjs";

export class UserSocketStore
{
	static userSockets = new Map()

	static setUserSockets(id: string, sockets: string) 
	{
		let tmp: string[] = this.getUserSockets(id);
		this.userSockets.set(id, [...tmp, sockets]);
		console.log(this.getUserSockets(id))
  	}

	static getUserSockets(id: string): string[]
	{
		return (this.userSockets.get(id));
	}
}