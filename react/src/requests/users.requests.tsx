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
