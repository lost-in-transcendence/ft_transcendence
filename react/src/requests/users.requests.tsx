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

import { backURL } from "./constants";
import { getCookie } from "./cookies";
import { SharedUpdateUserDto } from '../../shared/dtos'

export async function getUserMe()
{
    const res = await fetch(`${backURL}/users/me`, 
	{
		method: 'GET',
		headers: {"Authorization": "Bearer " + getCookie("jwt")}
	});
	if (res.status !== 200)
	{
		throw res
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
		throw res
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
		throw res
	}
	return res;
}


export async function updateUser(params : SharedUpdateUserDto)
{
	return fetch(`${backURL}/users`, 
	{
		method: 'PATCH',
		headers: {
			"Authorization": "Bearer " + getCookie("jwt"),
			"Content-Type": "application/json"
		},
		body: JSON.stringify(params)
	});
}


export async function updateAvatar(formData : any, id: string)
{
	return await fetch(`${backURL}/users/avatar/${id}`,
	{
		method: 'POST',
		headers: {
			"Authorization": "Bearer " + getCookie("jwt"),
		},
		body: formData,
	});
}