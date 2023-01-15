import { RiCheckboxBlankCircleLine as Unchecked, RiCheckboxCircleLine as Checked } from 'react-icons/ri'

export function CheckBox({ checked = false }: { checked: boolean })
{
	return (
		checked ? <Checked /> : <Unchecked />
	)
}