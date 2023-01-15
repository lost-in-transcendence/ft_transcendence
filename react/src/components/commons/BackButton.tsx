import { IoReturnDownBackSharp } from "react-icons/io5";

interface IBackButtonProps
{
	goBack: () => void
}

export function BackButton({goBack}: IBackButtonProps)
{
	return (
		<button
			className="bg-rose-900 hover:bg-red-700 rounded shadow px-2 "
			onClick={() => goBack()}
		>
			<IoReturnDownBackSharp size={30} />
		</button>
	)
}
