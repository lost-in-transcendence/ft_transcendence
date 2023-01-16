import { isRouteErrorResponse, Navigate, redirect, useRouteError } from "react-router-dom";
import { logout } from "../requests";
import { NotFound } from "./notFound";

export function ErrorPage()
{
	const error: any = useRouteError();

	if (isRouteErrorResponse(error))
	{
		if (error.status === 401)
		{
			logout();
			return (
				<Navigate to='/login' state={{error: "You are not logged in!"}}/>
			)
		}

	}

	if (error.status === 404)
		return (
			<NotFound />
		)

	return (
		<div id="error-page">
			<h1>Oops</h1>
			<p>Sorry, an unexpected error has occurred.</p>
			<p>
				<i>{error.statusText || error.message}</i>
			</p>
		</div>
	)
}
