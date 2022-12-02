import { Injectable, ValidationError, ValidationPipe } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";

@Injectable()
export class WsValidationPipe extends ValidationPipe
{
	createExceptionFactory(): (validationErrors?: ValidationError[]) => unknown
	{
		return (validationErrors = []) =>
		{
			if (this.isDetailedOutputDisabled)
				return new WsException('Bad Request');
			const errors = this.flattenValidationErrors(validationErrors);
			return new WsException(errors);
		}
	}
}
