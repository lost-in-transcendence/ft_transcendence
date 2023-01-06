import { useEffect, useState } from "react";
import { backURL } from "../requests";

export function useBlacklist()
{
	const [blackList, setBlacklist] = useState([]);

	useEffect(() =>
	{
		const fetchData = async () =>
		{
			const res = await fetch(`${backURL}/blacklist`, { method: 'GET' });
			const data = await res.json();
			setBlacklist(data);
		}

		fetchData()
			.catch(() => { });
	})

	return (blackList);
}
