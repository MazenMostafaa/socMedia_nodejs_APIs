import { globalResponse } from './errorHandler.js'
import { dbConnection } from "../../db/connection.js"
import * as allRouters from '../modules/index.routes.js'
import helmet from "helmet"
import { initiateIO, SocketAuth } from './socketIo.js'

export const initiateApp = (app, express) => {

    const port = +process.env.PORT || 5000

    // connection of DB
    dbConnection()

    app.use(express.json())

    app.use(helmet())

    app.get('/', (req, res) => res.status(200).json('Hello from Social media app!'))


    app.use('/api/auth', allRouters.authRouters)
    app.use('/api/users', allRouters.userRouters)
    app.use('/api/post', allRouters.postRouter)
    app.use('/api/chat', allRouters.chatRouter)

    app.use(globalResponse)


    // router in case there's no routers match
    app.all('*', (req, res) => { res.status(404).json({ Message: "404 Not fount URL" }) })




    const httpServer = app.listen(port, () => { console.log(`...Server is running on Port ${port}`); })

    const io = initiateIO(httpServer)

    io.on('connection', async (socket) => {
        console.log({ socketId: socket.id })
        await SocketAuth({ socket })
    })
}