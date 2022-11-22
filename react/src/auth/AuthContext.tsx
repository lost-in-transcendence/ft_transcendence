import { createContext, JSXElementConstructor, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { backURL } from "../requests";
import { getCookie } from "../requests/cookies";

type AuthContextType =
{
	// isAuth: boolean;
	// currentUser: any;
	isLoggedIn: Function;
	logout: Function;
	isAuth: boolean;
	setIsAuth: Function;
}

export const AuthContext = createContext<AuthContextType>({logout: () => {}, isLoggedIn: () => {}, isAuth: true, setIsAuth: () => {}});

type AuthProps =
{
	children: JSX.Element;
}

export function Auth({children}: AuthProps)
{
	const [isAuth, setIsAuth] = useState(false);


	const logout = async () =>
	{
		
		// `${backURL}/auth/logout`, "_self");
	}

	const isLoggedIn = () =>
	{
		return isAuth;
	}

	return (
		<AuthContext.Provider value={{logout, isLoggedIn, isAuth, setIsAuth}}>
			{children}
		</AuthContext.Provider>
	)
}


