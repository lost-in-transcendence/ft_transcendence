import { createContext, JSXElementConstructor, useState } from "react";

type AuthContextType =
{
	isAuth: boolean;
	login: Function;
	logout: Function;
}

export const AuthContext = createContext<AuthContextType>({isAuth: false, login: () => {}, logout: () => {}});

type AuthProps =
{
	children: JSX.Element;
}

export function Auth({children}: AuthProps)
{
	const [isAuth, setIsAuth] = useState(false);

	const login = () =>
	{
		setIsAuth(true);
	}

	const logout = () =>
	{
		setIsAuth(false);
	}

	return (
		<AuthContext.Provider value={{isAuth, login, logout}}>
			{children}
		</AuthContext.Provider>
	)
}


