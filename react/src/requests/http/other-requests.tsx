import { backURL } from "../constants";
import { getCookie } from "../cookies";

export async function getLeaderBoard()
{
    const res = await fetch(`${backURL}/ranks/get-leaderboard`,
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