import { useContext, useEffect, useState } from "react";
import { Form, redirect, useActionData, useLoaderData, useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import { getCookie } from "../requests/cookies"
import { Navigate } from "react-router-dom";
import { toggleTwoFa } from "../requests/auth.requests"
import { backURL, frontURL } from "../requests/constants";

import './styles/profile.css'
import { getUserMeFull, updateUser, updateAvatar } from "../requests/users.requests";

function popupwindow(url: string, title: string, w: number, h: number) {
	var left = Math.round(window.screenX + (window.outerWidth - w) / 2);
	var top = Math.round(window.screenY + (window.outerHeight - h) / 2.5);
	return window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
}

export async function loader() {
	const res = await getUserMeFull();
	if (res.status !== 200)
		return (redirect('/login'));
	return (res);
}

export async function action({request}: any) {
	const formData = await request.formData();
	const updates = Object.fromEntries(formData);
	const res = await updateUser(updates);
	if (!res.ok)
	{
		throw res;
	}
	return {status: "updated"};
}


async function handleToggleTwoFa() {

	const res = await toggleTwoFa();

	if (res.status !== 200)
	{
		throw new Error('Wrong code!');
	}
	return res;
}

export function ProfileEdit() {
	const user: any = useLoaderData();
	const [status, setStatus] = useState('waiting');
	const [twoFa, setTwoFa] = useState<boolean>(user.twoFaEnabled);
	const [error, setError] = useState(null);
	const [edit, setEdit] = useState(false);
	const [file, setFile] = useState(null);
	const [upload, setUpload] = useState('idle');
	const [fileError, setFileError] = useState('ok');
	const action: any = useActionData();
	
	
	async function onMessage(event: MessageEvent) 
	{
		if (status === "loading")
		return;
		let done = false;
		switch (event.data) 
		{
			case 'loading':
			{
				break;
			}
			case 'error':
			{
				done = true;
				break;
			}
			case 'success':
			{
				done = true;
				break;
			}
		}
		if (done) {
			window.removeEventListener('message', onMessage);
		}
		setStatus(event.data);
	}
		
	async function enableTwoFa() 
	{
		setStatus('loading')
		window.addEventListener('message', onMessage);
		const childWindow = popupwindow(`${frontURL}/login/twofa`, 'Log In', 400, 600);
		if (childWindow) 
		{
			const timerId = setInterval(async () => 
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
	
	async function disableTwoFa()
	{
		try 
		{
			await handleToggleTwoFa()
			setTwoFa(false);
		}
		catch(err: any)
		{
			setError(err.message);
		}
	}

	async function handleOnClickTwoFa() 
	{
		if (twoFa === true) 
		{
			disableTwoFa();
		}
		else if (twoFa === false)
		{
			enableTwoFa();
		}
	}
	
	useEffect(() =>
	{
		if (status === 'success')
		{
			setStatus('waiting');
			try 
			{
				handleToggleTwoFa()
				setTwoFa(true);
			}
			catch(err: any)
			{
				setError(err.message);
			}
			
		}
		return (() => {})
	});

	useEffect(() => 
	{
		if (action?.status == "updated" && edit == true)
		{
			setEdit(false);
			action.status = "pending";
		}
	});

	useEffect(() =>
	{
		if (upload === 'fetched')
		{
			console.log('useEffect lol time = ' + Date.now());
			setUpload('idle');
		}
	},[upload]);

	async function uploadFile(file : any)
	{
		if (file)
		{
			const formData = new FormData();
			formData.append("avatar", file);
			const res = await updateAvatar(formData, user.id);
			if (!res.ok)
			{
				throw res;
			}
		}
	}

	function handleOnChange(e: any)
	{
		if (e?.target?.files[0]?.size <= 1048576)
		{
			setFile(e.target.files[0]);
			setFileError('ok');
		}
		else {
			setFileError('too large');
			e.target.value = "";
		}
	}
	
	async function handleSubmit(e: any)
	{
		e.preventDefault();

		setUpload(()=>'fetching')
		let res = await uploadFile(file);
		setUpload(() => 'fetched');
	}

	return (
		<div>
			<div className="profileEditPage">
				<div className="profileTitle">
					<div className="profileImg">
						<img src={`${backURL}/users/avatars/${user.id}?time=${Date.now()}`} />
						<form id="userAvatarForm" encType="multipart/form-data" method='post' onSubmit={handleSubmit}>
							<input
								id="avatar"
								name="avatar"
								aria-label="userIcon"
								type="file"
								accept="image/*"
								onChange={handleOnChange}
							/>
							<button type="submit">Upload</button>
							{fileError === 'too large' ? (<><br/><p><b>File must not exceed 1Mb</b></p></>) : (<></>)}
						</form>
					</div>
					<div className="profileInfo">
						{
							edit == true ?
								(<Form id="userInfosForm" method="post" action="/profile/edit">
									<input
										id="userName"
										name="userName"
										aria-label={user.userName}
										placeholder={user.userName}
										type="text"
										defaultValue={user.userName}
									/>
									<br />
									<input
										id="email"
										name="email"
										aria-label={user.email}
										placeholder={user.email}
										type="text"
										defaultValue={user.email}
									/>
									<br />
									<button	type="submit">Submit</button>

								</Form>) : 
								(
									<>
										<h3>{user.userName}</h3>
										<p>{user.email}</p>
										<button onClick={() => {setEdit(true);}}>Edit</button>
									</>
								)
						}
						
					</div>
				</div>
			</div>
			<>
				<button onClick={handleOnClickTwoFa}>{twoFa === true ? ('Disable') : ('Enable')} 2fa</button>
				<p>status = {status}</p>
				<p>twoFa = {twoFa === true ? 'true' : 'false'}</p>
				<p>user.twoFaEnabled = {user.twoFaEnabled === true ? 'true' : 'false'}</p>
				<p>error = {error}</p>
			</>
		</div>
	)
}
