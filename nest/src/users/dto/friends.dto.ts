import { IsNotEmpty, IsUUID } from "class-validator";
import { SharedUpdateFriendsDto } from "shared/dtos";

export class UpdateFriendsDto implements SharedUpdateFriendsDto
{
    @IsNotEmpty()
    @IsUUID()
    readonly userId: string;
}