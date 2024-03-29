// naming conventions:
// action + Model + Other Stuff
//
// GET : get
// POST: create/add/other
// PATCH: update/change
// DELETE: delete/remove
//
// example:
// getUserMe
// changeChannelMode

import { backURL } from "../constants";
import { getCookie } from "../cookies";
import { SharedUpdateUserDto } from '../../../shared/dtos'

export async function getUser(userName : string)
{
	const res = await fetch(`${backURL}/users/view/${userName}`,
	{
		method: 'GET',
		headers: {"Authorization": "Bearer " + getCookie("jwt")}
	});
	if (res.status !== 200)
	{
		throw res;
	}
	return res;
}

export async function getUserModal(userName : string, params : URLSearchParams)
{
	const res = await fetch(`${backURL}/users/view/${userName}/modal?` + params,
	{
		method: 'GET',
		headers: {"Authorization": "Bearer " + getCookie("jwt")}
	});
	if (res.status !== 200)
	{
		throw res;
	}
	return res;
}



export async function getUserMe()
{
    const res = await fetch(`${backURL}/users/me`, 
	{
		method: 'GET',
		headers: {"Authorization": "Bearer " + getCookie("jwt")}
	});
	if (res.status !== 200)
	{
		throw res;
	}
	return res;
}

export async function getUserMeFull()
{
    const res = await fetch(`${backURL}/users/me/complete`,
	{
		method: 'GET',
		headers: {"Authorization": "Bearer " + getCookie('jwt')}
	});
	if (res.status !== 200)
	{
		throw res;
	}
	return res;
}

export async function getUserMeModal(params : URLSearchParams)
{
	const res = await fetch(`${backURL}/users/me/modal?` + params, 
	{
		method: 'GET',
		headers: {"Authorization": "Bearer " + getCookie("jwt")}
	});
	if (res.status !== 200)
	{
		throw res;
	}
	return res;
}

export async function getUserMeSelect(params : URLSearchParams)
{
	const res = await fetch(`${backURL}/users/me/select?` + params, 
	{
		method: 'GET',
		headers: {"Authorization": "Bearer " + getCookie("jwt")}
	});
	if (res.status !== 200)
	{
		throw res;
	}
	return res;
}

export async function updateUser(params : SharedUpdateUserDto)
{
	const res = await fetch(`${backURL}/users`, 
	{
		method: 'PATCH',
		headers: {
			"Authorization": "Bearer " + getCookie("jwt"),
			"Content-Type": "application/json"
		},
		body: JSON.stringify(params)
	});
	if (res.status !== 200)
	{
		throw res;
	}
	return res;
}


export async function updateAvatar(formData : any, userName: string)
{
	const res = await fetch(`${backURL}/users/avatar/${userName}`,
	{
		method: 'POST',
		headers: {
			"Authorization": "Bearer " + getCookie("jwt"),
		},
		body: formData,
	});
	if (res.status !== 200)
	{
		throw res;
	}
	return res;
}

export async function getAllUsersSelect(params : URLSearchParams)
{
	const res = await fetch(`${backURL}/users/all/select?` + params, 
	{
		method: 'GET',
		headers: {"Authorization": "Bearer " + getCookie("jwt")}
	});
	if (res.status !== 200)
	{
		throw res;
	}
	return res;
}

export async function getMyMatchHistory()
{
	const res = await fetch (`${backURL}/match-history/me`,
	{
		method: 'GET',
		headers: {"Authorization": "Bearer " + getCookie("jwt")}
	});
	if (res.status !== 200)
	{
		throw res;
	}
	return res;
}

export async function getUserMatchHistory(userId: string)
{
	const res = await fetch(`${backURL}/match-history/get/${userId}`,
	{
		method: 'GET',
		headers: {"Authorization": "Bearer " + getCookie("jwt")}
	});
	if (res.status !== 200)
	{
		throw res;
	}
	return res;
}

export async function getOngoingGame(userName: string)
{
	const res = await fetch(`${backURL}/games/ongoing`,
	{
		method: 'POST',
		headers: 
		{
			"Authorization": "Bearer " + getCookie("jwt"),
			"Content-Type": "application/json"
		},
		body: JSON.stringify({userName})

	})
	if (res.status !== 200)
	{
		throw res;
	}
	return res;
}