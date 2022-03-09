import { config } from "dotenv";
config();

import express, { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import routes from './routes';
import { Socket } from 'socket.io';
import busboy from "connect-busboy";

const app = express();
// eslint-disable-next-line @typescript-eslint/no-var-requires
const http = require('http').Server(app);
// eslint-disable-next-line @typescript-eslint/no-var-requires

const io = require('socket.io')(http, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

app.use(express.json({ limit: "1gb" }));
app.use(express.urlencoded({ extended: false, limit: "1gb" }));
app.use(
    helmet({
        contentSecurityPolicy: false,
    })
);
app.use(cors());
app.disable("x-powered-by");
app.use(busboy({
    highWaterMark: 1073741824
}));

app.use(function (req: Request, res: Response, next: NextFunction) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Access-Control-Allow-Headers, Origin, Accept, Authorization, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
    );
    res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PATCH, PUT, OPTIONS"
    );
    res.header("Cross-Origin-Resource-Policy", "cross-origin");
    next();
});

app.use((req, res, next) => {

    req.startTime = Date.now();
    req.socketio = io;

    next();
});



/*app.get("/api/v1/*", async (req: Request, res: Response): Promise<any> => {
    return res.status(200).json({ code: 404, message: "Resource not found" });
});*/

app.use(routes);


io.on('connection', (socket: Socket) => {
    console.log('connected', socket.id);
});

http.listen(process.env.API_PORT, function () {
    return console.log('listening on *:' + process.env.API_PORT);
});