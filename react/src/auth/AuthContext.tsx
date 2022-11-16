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

	const refreshToken = async () =>
	{
		const token = (await fetch(`http://localhost:3333/auth/refresh`, 
		{
			method: 'GET',
			headers: {"Authorization": "Bearer " + getCookie("jwt")},
			credentials: 'include',
		})
		);
		if (token.ok && token.status >= 200 && token.status <= 299) {
			setIsAuth(() => true);
		}
		else {
			setIsAuth(() => false);
		}
	}

	const isLoggedIn = () =>
	{
		//check le back
		console.log('lol');
		const jwtCookie = getCookie('jwt');
		// if (!jwtCookie)
		// 	return false;
		//verif validite du token
	
		const expireCookie = getCookie('jwtExpiration');
		const timeElapsed = Number(expireCookie) - Date.now();
		console.log(`now : ${Date.now()} expire : ${Number(expireCookie)} elapsed : ${timeElapsed}`);
		if ( timeElapsed < /*24 * 60 * 60 * */  (4 * 60 * 1000)  + (50 * 1000) && timeElapsed > 0) {
			refreshToken();
		}
		else {
			setIsAuth(() => true);
		}
		return isAuth;
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


