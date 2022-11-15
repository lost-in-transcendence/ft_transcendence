import { Link, Navigate, Outlet, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../auth/AuthContext";

function popupwindow(url: string , title: string, w: number, h: number) 
{
	var left = Math.round(window.screenX + (window.outerWidth - w) / 2);
	var top = Math.round(window.screenY + (window.outerHeight - h) / 2.5);
	return window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left);
  } 

export function Login()
{
	const auth = useContext(AuthContext);
	const [status, setStatus] = useState('waiting');


	async function onMessage(event: MessageEvent)
	{
		if (status === "loading")
			return;
		let done = false;
		console.log(event.data);
		switch (event.data)
		{
			case 'loading':
			{
				break;
			}
			case 'error':
			case 'success':
			{
				done = true;
				break;
			}
		}
		if (done)
		{
			window.removeEventListener('message', onMessage);
		}
		setStatus(event.data);
	}
	async function login()
	{
		setStatus('loading')
		window.addEventListener('message', onMessage);
		const childWindow = popupwindow("http://localhost:3333/auth/login", 'Log In', 400, 600);
		if (childWindow) 
		{
			const timerId = setInterval(() => 
			{
			  if (childWindow.closed) 
			  {
				clearInterval(timerId)
				setStatus((prevState) =>
				{
					if (prevState === 'loading')
						return 'waiting';
					return prevState;
				});
			  }
			}, 100)
		}
	}
	return (
		<div>
			{status === 'success' &&
			<Navigate to={"/home"} />}
			<h1>Login</h1>
			{/* <Link to={"/home"}>
				<button onClick={() => auth.login()}>Login</button>
			</Link> */}
			<button onClick={login}>
				Log in
			</button>
			{status === 'loading' &&
			<p>Loading</p>}
			{status === 'error' &&
			<p>BIG ERROR!!!</p>}
			{/* <button */}
			<p>state = {status}</p>

		</div>
	)
}