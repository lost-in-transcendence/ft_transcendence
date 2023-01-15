import { Spinner } from "../Spinner/Spinner";

export function MatchAccepted()
{
	return (
		<div className="flex flex-col gap-4 w-full ">
			<div className="flex flex-col items-center m-auto text-xl text-gray-400 bg-gray-700">
				<p>Waiting for the other player</p>
				<Spinner />
			</div>
		</div>
	)
}
