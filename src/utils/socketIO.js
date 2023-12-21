import { Server } from 'socket.io'
import { socketAuth } from '../middlewares/auth.js';
import { systemRoles } from './systemRoles.js'
import { userModel } from '../../db/models/userModel.js'

let io;

export function initiateIO(httpServer) {
    io = new Server(httpServer, {
        cors: '*'
    })
    return io;
}

export const getIO = () => {
    if (!io) {
        return new Error('can not get io', { cause: 500 })
    }
    return io
}

export const SocketAuth = async ({ socket } = {}) => {

    socket.on('updateSocketId', async (data) => {
        console.log(data);
        const { _id } = await socketAuth(data.token, [systemRoles.USER, systemRoles.ADMIN], socket?.id)

        if (_id) {
            await userModel.updateOne({ _id }, { socketId: socket.id })
            return socket.emit('updateSocketId', "Done")
        }
    })
}