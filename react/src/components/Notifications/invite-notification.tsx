import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Socket } from "socket.io-client";
import { backURL } from "../../requests";

export function displayInviteNotification(inviter: string, inviterId: string, gameId: string, socket?: Socket)
{
    const id = toast(
    <InviteNotification inviter={inviter} inviterId={inviterId} gameId={gameId} socket={socket}/>, 
    {
        className: "bg-gray-300",
        toastId: '1',
        draggable: false
    })
    console.log('toast Id:', id);
}

export function InviteNotification(props: {inviter: string, inviterId: string, gameId: string, socket?: Socket, closeToast?: any, toastProps?: any})
{
    const navigate = useNavigate();
    let declineInvite = true;

    const {inviter, inviterId, gameId, socket, closeToast, toastProps} = props;
    useEffect(() =>
    {
        return () =>
        {
            if (declineInvite === true)
            {
                socket?.emit('declineInvite', {inviterId});
            }
        }
    }, [])

    function accept()
    {
        declineInvite = false;
        closeToast();
        navigate('/game?' + new URLSearchParams({'action': 'joinInvite', 'gameId' : gameId, 'userName' : inviter}));
        socket?.emit("closeNotification", {id: '1'});
    }

    function decline()
    {
        closeToast();
        socket?.emit("closeNotification", {id: '1'});
    }

    return (
        <>
        <div className="text-center text-black">
            <p>Game invite by</p>
            <div className="flex items-center gap-4 justify-center my-[5px]">
                <img className="w-[50px] h-[50px] rounded-full" src={`${backURL}/users/avatars/${inviter}`} />
                <p className="text-xl">{inviter}</p>
            </div>
            <button className="bg-indigo-300 shadow border rounded self-center p-1 mx-[5px]" onClick={accept}>Accept</button>
            <button className="bg-indigo-300 shadow border rounded self-center p-1 mx-[5px]" onClick={decline}>Decline</button>
        </div>
        </>
    )
}