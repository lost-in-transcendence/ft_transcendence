import { backURL } from "../constants";
import { getCookie } from "../cookies";

export async function addFriend(id: string): Promise<boolean>
{
    const res = await fetch(`${backURL}/friends/add` , 
    {
        method: 'PATCH',
        headers: 
        {
            'Authorization' : 'Bearer ' + getCookie('jwt'),
            "Content-Type": "application/json"
        },
        body: JSON.stringify({userId: id}),
    });
    if (res.status !== 200)
    {
        throw res;
    }
    return res.ok;
}

export async function removeFriend(id: string) : Promise<boolean>
{
    const res = await fetch(`${backURL}/friends/remove` , 
    {
        method: 'PATCH',
        headers: 
        {
            'Authorization' : 'Bearer ' + getCookie('jwt'),
            "Content-Type": "application/json"
        },
        body: JSON.stringify({userId: id}),
    });
    if (res.status !== 200)
    {
        throw res;
    }
    return res.ok;
}