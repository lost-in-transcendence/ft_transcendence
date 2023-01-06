import { GiPingPongBat as SpinnerIcon } from 'react-icons/gi';
import { ImSpinner8 } from 'react-icons/im'

export function Spinner({size = 30, className = ''})
{
	return (
		<div className="flex justify-center items-center">
			<ImSpinner8 className={className + ' animate-spin text-green-500'} size={size} />
		</div>
	)
}
