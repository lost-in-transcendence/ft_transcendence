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
}

export const AuthContext = createContext<AuthContextType>({login: () => {}, logout: () => {}, isLoggedIn: () => {}});

type AuthProps =
{
	children: JSX.Element;
}

export function Auth({children}: AuthProps)
{
	const [isAuth, setIsAuth] = useState(false);

	// const [currentUser, setCurrentUser] = useState({});

	// const [cookies, setCookies, removeCookies] = useCookies();

	const login = () =>
	{
		// setIsAuth(true);
		window.open("http://localhost:3333/auth/login", "_self");
	}

	const logout = () =>
	{
		// setIsAuth(false);
		window.open("http://localhost:3333/auth/logout", "_self");
	}

	const isLoggedIn = () =>
	{
		//check le back
		console.log("test");
		return getCookie('jwt');
	}

	// const value = useMemo( () =>
	// (
	// 	{
	// 		// cookies,
	// 		login,
	// 		logout
	// 	}))
	// 	// }),
	// 	// [cookies])

	return (
		<AuthContext.Provider value={{login, logout, isLoggedIn}}>
			{children}
		</AuthContext.Provider>
	)
}


