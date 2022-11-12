import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import usersRoute from './routes/usersRoute';
import path from 'path';

const app = express();
app.use(express.json()); // pre-defined middleware format json for body requests
app.use(express.urlencoded({ extended: true })); // pre-defined middleware format arrays and strings for body requests

const expressMiddleware: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    console.log(`First middleware`);
    console.log(`headers ${JSON.stringify(req.headers)}`);
    // the next function will call to the next middleware, if none goes to the request handling
    next()
}
app.use(expressMiddleware);

const printRequest: RequestHandler = function (req: Request, res: Response, next: NextFunction) {
    console.log(`Second middleware`);
    console.log(`-----> ${req.method} ${req.url} request received with body ${JSON.stringify(req.body)}`);
    next()
}
app.use(printRequest);
app.use('/api', printRequest); // this middleware will be added only for paths starting with /api

// example for pre-defined middleware to forward a request to another server
// const {createProxyMiddleware} = require('http-proxy-middleware');
// const screenAgentProxy = createProxyMiddleware('/screenagent', {target: 'http://localhost:31322'});
// app.use(screenAgentProxy);

// example for pre-defined middleware cors  (Access control Cross-Origin requests between different domains)
// import cors from require('cors')   // needs to install @types/cors 
// app.use(cors())

// static file serving
// http://localhost:3000/static/images/dog.jpg
app.use('/static', express.static(path.join(__dirname, 'public')));

// for all calls starting with /users it sends to file usersRouter.ts
app.use('/users', usersRoute);

// http://localhost:3000/ 
app.get('/', (req: Request, res: Response) => {
    res
        .type('.html')
        .status(200)
        .send('<h1>hello World!</h1>');
});

app.get('/hello', (req: Request, res: Response) => {
    // We can access from all routers or endpoints to req.app.locals 
    req.app.locals.idaVariable = "IDA";
    res.redirect('/static/images/dog.jpg');
});

// Path parameters (:id) will always be string 
app.post('/tasks/:id', (req: Request, res: Response) => {
    console.log(`id was ${req.params.id} headers ${JSON.stringify(req.body)}`);
    res
        .type('.json')
        .status(200)
        .send({ foo: "bar" });
});

app.listen(3000, () => { console.log("listing on port 3000 !") })
