import { Logger } from "@nestjs/common";

export class TimeoutStore
{
	private static readonly logger = new Logger(TimeoutStore.name);
	static timeouts = new Map<string, NodeJS.Timeout>()

	static setTimeoutId({channelId, userId}: {channelId: string, userId: string}, timeoutId: NodeJS.Timeout) 
	{
        const key = channelId + userId
		const currentTimeoutId = this.timeouts.get(key);
		if (currentTimeoutId)
			clearTimeout(currentTimeoutId);
        this.timeouts.set(key, timeoutId)
    }

	static clearTimeoutId({channelId, userId}: {channelId: string, userId: string})
	{
        const key = channelId + userId
        const timeoutId = this.timeouts.get(key);
		if (timeoutId)
		{
			clearTimeout(timeoutId);
			this.timeouts.delete(key);
		}
	}

	static getTimeoutId({channelId, userId}: {channelId: string, userId: string})
	{
        const key = channelId + userId
		return (this.timeouts.get(key));
	}
}