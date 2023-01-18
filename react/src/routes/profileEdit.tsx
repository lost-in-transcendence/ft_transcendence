
import { useContext, useEffect, useRef, useState } from "react";
import { Form, redirect, useActionData, useLoaderData, useNavigate } from "react-router-dom";
import { FaFileUpload as UploadIcon } from 'react-icons/fa'
import { BsPencilFill, BsCheckLg } from 'react-icons/bs'

import { generateTwoFa, toggleTwoFa } from "../requests"
import { backURL } from "../requests/constants";
import { getUserMeFull, updateUser, updateAvatar } from "../requests";
import Modal from "../components/Modal/modal";
import { TwoFa } from "../components/TwoFa/twofa";
import SocketContext from "../components/Socket/socket-context";

export async function loader()
{
	const res = await getUserMeFull();
	if (res.status !== 200)
		return (redirect('/login'));
	return (res);
}

export async function action({ request }: any)
{
	const formData = await request.formData();
	const updates = Object.fromEntries(formData);

	if (!updates?.userName && !updates?.email)
	{
		return { status: "empty field" };
	}
	else if (updates?.userName?.length > 32)
	{
		return { status: "name too long" };
	}
	let res = undefined;
	try {
		res = await updateUser(updates);
	}
	catch (err: any)
	{
		if (err.status === 406)
		{
			return { status: "unavalaible input" };
		}
		else if (err.status === 404 && err.message === 'Email not found')
		{
			return { status : "Couldn't send the code... please check that your email is valid" }
		}
		throw res;
	}
	let ret: any = { status: "updated" };
	if (updates?.userName)
	{
		ret = { ...ret, userName: updates.userName }
	}
	return ret;
}

async function handleToggleTwoFa()
{
	try
	{
		const res = await toggleTwoFa();
		return res;
	}
	catch (e: any)
	{
		if (e.status !== 200)
		{
			throw new Error('Wrong code!');
		}
	}
}

export function ProfileEdit()
{
	const user: any = useLoaderData();
	const [status, setStatus] = useState('waiting');
	const [error, setError] = useState<string | null>(null);
	const [mailError, setMailError] = useState<Boolean>(false);
	const [edit, setEdit] = useState(false);
	const [userNameEdit, setUserNameEdit] = useState(false);
	const [emailEdit, setEmailEdit] = useState(false);
	const [file, setFile] = useState(null);
	const [upload, setUpload] = useState('idle');
	const [fileError, setFileError] = useState('ok');
	const action: any = useActionData();
	const masterSocket = useContext(SocketContext).SocketState.socket;
	const twoFa = useContext(SocketContext).SocketState.user.twoFaEnabled;

	const uploadRef = useRef<HTMLInputElement>(null);

	const [isModalOpen, setIsModalOpen] = useState(false);

	async function onModalOpen()
	{
		setMailError(false);
		try{
			const res : any = await generateTwoFa();
			if (res?.status !== 200)
			{
				setError("Error generating OTP");
			}
			return res.ok;
		}
		catch (err : any)
		{
			setMailError(true);
			setIsModalOpen(false);
		}
	}

	async function enableTwoFa()
	{
		setStatus('loading');
		setIsModalOpen(true);
	}

	async function disableTwoFa()
	{
		try
		{
			await handleToggleTwoFa()
			masterSocket?.emit('changeTwoFa')
			// setTwoFa(false);
		}
		catch (err: any)
		{
			setError(err.message);
			setStatus('error');
		}
	}

	async function handleOnClick()
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
				handleToggleTwoFa();
				masterSocket?.emit('changeTwoFa')
				// setTwoFa(true);

			}
			catch (err: any)
			{
				setError(err.message);
				setStatus('error');
			}

		}
		return (() => { })
	}, [status]);

	useEffect(() =>
	{
		if (action?.status === "updated" && action?.userName)
		{
			masterSocket?.emit("changeUserName", { userName: action.userName });
			action.userName = undefined;
		}
		if (action?.status === "updated" && (userNameEdit === true || emailEdit === true))
		{
			setUserNameEdit(false);
			setEmailEdit(false);
			action.status = "pending";
		}
	});

	useEffect(() =>
	{
		if (upload === 'fetched')
		{
			setUpload('idle');
		}
	}, [upload]);

	async function uploadFile(file: any)
	{
		if (file)
		{
			const formData = new FormData();
			formData.append("avatar", file);
			const res = await updateAvatar(formData, user.userName);
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
		else
		{
			setFileError('too large');
			e.target.value = "";
		}
	}

	async function handleSubmit(e: any)
	{
		e.preventDefault();

		setUpload(() => 'fetching')
		let res = await uploadFile(file);
		setUpload(() => 'fetched');
	}

	return (
		<div className="profileEditPage flex flex-col justify-start gap-2 items-start text-gray-300 h-full">
			<div className="profileImg bg-gray-700 w-fit min-w-[320px] m-1 p-1 rounded shadow">
				<h2 className="text-3xl font-semibold w-fit min-w-[320px]">Change avatar</h2>
				<div className="flex justify-start items-end m-2 p-2">
					<img
						src={`${backURL}/users/avatars/${user.userName}?time=${Date.now()}`}
						className='rounded-full w-24 h-24'
					/>
					<form
						id="userAvatarForm"
						encType="multipart/form-data"
						method='post'
						onSubmit={handleSubmit}
						className='flex gap-2 items-center'
					>
						<label>
							<input
								ref={uploadRef}
								id="avatar"
								name="avatar"
								aria-label="userIcon"
								type="file"
								accept="image/*"
								onChange={handleOnChange}
								className='hidden'
							/>
							<UploadIcon className="cursor-pointer" />
						</label>
						<p className="underline overflow-hidden truncate" >
							{
								uploadRef.current?.value ?
									uploadRef.current.value
									:
									'No file chosen'
							}
						</p>
						<button type="submit" className="bg-indigo-500 rounded shadow px-1">Upload</button>
						{fileError === 'too large' ? (<><br /><p><b>File must not exceed 1Mb</b></p></>) : (<></>)}
					</form>
				</div>
			</div>

			<div className="userNameEdit bg-gray-700 w-fit min-w-[320px] m-1 p-1 rounded shadow">
				<h2 className="text-3xl font-semibold w-fit min-w-[320px] mb-2">User name</h2>
				{
					userNameEdit === true ?
						<Form
							id="userInfosForm"
							method="post"
							action="/profile/edit"
						>
							<div className="flex justify-between items-center mx-1 gap-10">
								<input
									id="userName"
									name="userName"
									aria-label={user.userName}
									placeholder={user.userName}
									type="text"
									defaultValue={user.userName}
									className='rounded px-1 text-gray-800'
								/>
								<button type="submit" className="bg-indigo-500 rounded shadow p-1" >
									<BsCheckLg size={12} />
								</button>
							</div>
							{action?.status === 'empty field' ? (<><br /><p><b>Fields must not be empty</b></p></>) : (<></>)}
							{action?.status === 'name too long' ? (<><br /><p className="text-red-600">Name too long (32 characters max)</p></>) : (<></>)}
							{action?.status === 'unavalaible input' ? (<><p className="text-red-600 " >Username already taken</p></>) : (<></>)}

						</Form>
						:
						<div className="flex justify-between items-center mx-1 gap-10">
							<h3>{user.userName}</h3>
							<div
								onClick={() => { if (emailEdit === true) return;setUserNameEdit(true); }}
								className='cursor-pointer bg-indigo-500 rounded shadow p-1'
							>
								<BsPencilFill size={12} />
							</div>
						</div>
				}

			</div>
			<div className="emailEdit bg-gray-700 w-fit min-w-[320px] m-1 p-1 rounded shadow">
				<h2 className="text-3xl font-semibold w-fit min-w-[320px] mb-2">Email</h2>
				{
					emailEdit ?

						<Form id="userInfosForm" method="post" action="/profile/edit">
							<div className="flex justify-between items-center mx-1 gap-10">
								<input
									id="email"
									name="email"
									aria-label={user.email}
									placeholder={user.email}
									type="text"
									defaultValue={user.email}
									className='rounded px-1 text-gray-800'
								/>
								<button type="submit" className="bg-indigo-500 rounded shadow p-1">
									<BsCheckLg size={12} />
								</button>
							</div>
							{action?.status === 'empty field' ? (<><br /><p><b>Fields must not be empty</b></p></>) : (<></>)}
						</Form>
						:
						<div className="flex justify-between items-center mx-1 gap-10">
							<h3>{user.email}</h3>
							<div
								onClick={() => { if (twoFa || userNameEdit === true) return; setEmailEdit(true); }}
								className={`cursor-pointer rounded shadow p-1 peer ${twoFa ? 'bg-gray-500' : 'bg-indigo-500'}`}
							>
										<BsPencilFill size={12} />
							</div>
						</div>
				}
			</div>
			<div className="twoFA bg-gray-700 w-fit min-w-[320px] m-1 p-1 rounded shadow">
				<h2 className="text-3xl font-semibold w-fit min-w-[320px] mb-2">Toggle 2FA</h2>
				<div className="flex justify-between items-center mx-1 mb-1 gap-10">
					<span className="">{twoFa ? 'Enabled' : 'Disabled'}</span>
					<label className="relative inline-flex items-center cursor-pointer">
						<input
							type="checkbox"
							checked={twoFa}
							onChange={() => { }} value={''}
							className="sr-only peer"
							onClick={handleOnClick}

						/>
						<Modal isOpen={isModalOpen} onOpen={onModalOpen} onClose={() => { setIsModalOpen(false); setStatus(prevEvent => { if (prevEvent === 'loading') { return 'waiting' } return prevEvent; }) }}>
							<TwoFa onSuccess={() => { setIsModalOpen(false); setStatus('success') }} />
						</Modal>
						<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
					</label>
				</div>
				{mailError ? (<><br /><p><b>Could not send mail</b></p></>) : (<></>)}

			</div>
		</div>
	)
}
