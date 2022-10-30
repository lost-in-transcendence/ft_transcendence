import { useLoaderData } from "react-router-dom";

export async function loader()
{
	return (
		{
			userId: 1,
			userName: 'mchibane'
		}
	)
}

export function Profile()
{
	const user: any = useLoaderData();

	return (
		<div>
			<h1>Profile</h1>
			<p>{user.userName}</p>
		</div>
	)
}
