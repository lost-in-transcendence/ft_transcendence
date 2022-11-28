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

export async function getUserMe()
{
    return fetch(`${backURL}/users/me`, 
	{
		method: 'GET',
		headers: {"Authorization": "Bearer " + getCookie("jwt")}
	});
}

export async function getUserMeFull()
{
    return fetch(`${backURL}/users/me/complete`,
	{
		method: 'GET',
		headers: {"Authorization": "Bearer " + getCookie('jwt')}
	});
}

export async function getUserMeModal(params : URLSearchParams)
{
    return fetch(`${backURL}/users/me/modal?` + params, 
	{
		method: 'GET',
		headers: {"Authorization": "Bearer " + getCookie("jwt")}
	});
}

type UpdateUserDto =
{
    readonly userName?: string

    readonly email?: string
}

export async function updateUser(params : UpdateUserDto)
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