import { useContext } from 'react'
import { Socket } from 'socket.io-client';
import * as events from '../../../shared/constants/users'
import { SharedUserStatus } from '../../../shared/dtos';
import SocketContext from '../../components/Socket/socket-context'


export function changeStatus(socket: Socket | undefined, status: SharedUserStatus)
{
    socket?.emit(events.CHANGE_STATUS, {status})
}