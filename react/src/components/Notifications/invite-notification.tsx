import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Socket } from "socket.io-client";

export function displayInviteNotification(inviter: string, inviterId: string, gameId: string, socket?: Socket)
{
    toast(<InviteNotification inviter={inviter} inviterId={inviterId} gameId={gameId} socket={socket}/>, {theme: "dark", toastId: '1'})
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
                socket?.emit('declineInvite', {inviterId});
        }
    }, [])

    function accept()
    {
        declineInvite = false;
        closeToast();
        navigate('/game', {state: {action: 'joinInvite', gameId: gameId}});
    }

    function decline()
    {
        closeToast();
    }

    return (
        <>
            <p>You have been invited by {inviter}</p>
            <button onClick={accept}>Accept</button>
            <button onClick={decline}>Decline</button>
        </>
    )
}