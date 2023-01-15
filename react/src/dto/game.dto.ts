import { SharedPlayStatsDto } from "../../shared/dtos";
import { PartialUser } from "./users.dto";

export enum GameStatus
{
	NONE = "NONE",
	WAITING = "WAITING",
	INGAME = "INGAME"
}

export interface PlayStats extends SharedPlayStatsDto
{
	user: PartialUser
}