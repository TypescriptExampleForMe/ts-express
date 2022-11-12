import express, { Request, Response, NextFunction, RequestHandler } from 'express';
// additional documentation on validators https://express-validator.github.io/docs/index.html
import { body, validationResult, check } from 'express-validator';

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

// http://localhost:3000/ 
app.get('/', (req: Request, res: Response) => {
    res
        .type('.html')
        .status(200)
        .send('<h1>hello World!</h1>');
});

app.get('/hello', (req: Request, res: Response) => {
    res
        .status(200)
        .send('hello World!');
});

app.post('/createTask', (req: Request, res: Response) => {
    console.log(`headers ${JSON.stringify(req.body)}`);
    res
        .type('.json')
        .status(200)
        .send({ foo: "bar" });
});


// using validation
app.post(
    '/user',
    // username must be an email
    body('username').isEmail(),
    // password must be at least 5 chars long
    body('password')
        .not()
        .isIn(['123', 'password', 'god'])
        .withMessage('Do not use a common word as the password')
        .isLength({ min: 5 })
        .withMessage('must be at least 5 chars long')
        .matches(/\d/)
        .withMessage({
            message: 'must contain a number',
            errorCode: 1,
        }),
    (req, res) => {
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        res
            .status(200)
            .send({
                username: req.body.username,
                password: req.body.password
            });

    },
);

// using custom validation
app.post(
    '/user',
    check('email').custom(value => {
        // return User.findByEmail(value).then(user => {
        //     if (user) {
                return Promise.reject('E-mail already in use');
            // }
        // });
    }),
    check('password').custom((value, { req }) => {
        if (value !== req.body.passwordConfirmation) {
            throw new Error('Password confirmation is incorrect');
        }
    }),
    (req, res) => {
        // Handle the request somehow
    },
);

app.listen(3000, () => { console.log("listing on port 3000 !") })
