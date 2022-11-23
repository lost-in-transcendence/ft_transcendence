import { ArgumentMetadata, HttpException, Injectable, PipeTransform } from "@nestjs/common";
import { FindUniqueChannelDto } from "../dto/channel-dto";

function myXOR(a: string, b: string): boolean
{
	if ((!a && b) || (!b && a))
		return true;
	return false;
}

@Injectable()
export class FindUniqueChannelPipe implements PipeTransform
{
	transform(value: FindUniqueChannelDto, metadata: ArgumentMetadata)
	{
		if (!myXOR(value.channelName, value.id))
		{
			if (value.channelName && value.id)
				return ({id: value.id});
			throw new HttpException('Input must be exactly one of (XOR) channelName or id', 400);
		}
		return (value);
	}
}
