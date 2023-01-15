import { PlayStats } from "../../dto/game.dto";
import { backURL } from "../../requests";
import { RankingItem } from "./RankingItem";

export function Ranking({ranking} : {ranking: PlayStats[]})
{
    return (
        <table className="mt-5 table-auto w-full text-center text-gray-300">
			<thead className="table-header-group">
				<tr className="table-row">
					<th className="table-cell">Rank</th>
					<th className="table-cell text-left">
						<span className="relative left-20">
							Player
						</span>
					</th>
					<th className="table-cell">Points</th>
					<th className="table-cell">Wins</th>
					<th className="table-cell">Losses</th>
				</tr>
			</thead>
				<tbody className="table-row-group">
				{
					ranking.map((v: PlayStats, i: number) =>
					{
						return <RankingItem v={v} i={i} />
					})
				}
				</tbody>
		</table>
    )
}