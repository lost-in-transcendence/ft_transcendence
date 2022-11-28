import { RoleType } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";

export class joinChannelDto {
	@IsNotEmpty()
	@IsString()
	userId:	string;

	@IsNotEmpty()
	@IsString()
	channelName: string;

	@IsNotEmpty()
	@IsEnum(RoleType)
	role:	RoleType;
}