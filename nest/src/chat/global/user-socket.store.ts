import { Logger } from "@nestjs/common";
import { map } from "rxjs";

export class UserSocketStore
{
	private static readonly logger = new Logger(UserSocketStore.name);
	static userSockets = new Map()

	static setUserSockets(id: string, socket: string) 
	{
		this.logger.debug("hellooo");
		let tmp: string[] = this.getUserSockets(id);
		if (!tmp)
			this.userSockets.set(id, [socket])
		else
			this.userSockets.set(id, [...tmp, socket]);
		console.log(this.getUserSockets(id))
  	}

	static getUserSockets(id: string): string[]
	{
		return (this.userSockets.get(id));
	}
}