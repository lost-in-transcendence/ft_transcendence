import { PlayStats } from "../../dto/game.dto";
import { Podium } from "./Podium";

export function HallOfFame({ ranking }: { ranking: PlayStats[] | undefined })
{
	if (!ranking)
		return null;

	let number1: PlayStats | undefined = undefined;
	let number2: PlayStats | undefined = undefined;
	let number3: PlayStats | undefined = undefined;
	if (ranking.length >= 1)
		number1 = ranking.find((v) => { return v.rank === 1 });
	if (ranking.length >= 2)
		number2 = ranking.find((v) => { return v.rank === 2 });
	if (ranking.length >= 3)
		number3 = ranking.find((v) => { return v.rank === 3 });



	return (
		<div className="text-center text-white text-2xl">
			<h2>Hall of Fame</h2>
			<div className="w-[480px] mx-auto flex bg-white">
				<Podium number={2} player={number2} />
				<Podium number={1} player={number1} />
				<Podium number={3} player={number3} />
			</div>
		</div>
	)
}