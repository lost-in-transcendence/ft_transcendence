import { createContext, JSXElementConstructor, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { getCookie } from "../requests/cookies";

type AuthContextType =
{
	// isAuth: boolean;
	// currentUser: any;
	isLoggedIn: Function;
	login: Function;
	logout: Function;
	isAuth: boolean;
	setIsAuth: Function;
}

export const AuthContext = createContext<AuthContextType>({login: () => {}, logout: () => {}, isLoggedIn: () => {}, isAuth: true, setIsAuth: () => {}});

type AuthProps =
{
	children: JSX.Element;
}

export function Auth({children}: AuthProps)
{
	const [isAuth, setIsAuth] = useState(false);

	const login = () =>
	{
		window.open("http://localhost:3333/auth/login", "_self");
	}

	const logout = () =>
	{
		window.open("http://localhost:3333/auth/logout", "_self");
	}

	const isLoggedIn = () =>
	{
		return isAuth;
	}

	return (
		<AuthContext.Provider value={{login, logout, isLoggedIn, isAuth, setIsAuth}}>
			{children}
		</AuthContext.Provider>
	)
}


