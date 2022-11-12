import express, { Request, Response, NextFunction, RequestHandler } from 'express';
// additional documentation on validators https://express-validator.github.io/docs/index.html
import { body, validationResult, check } from 'express-validator';

const usersRoute = express.Router();


// all - for all requests types GET/POST/DELETE/PATCH .....
usersRoute.all('/alltypes', (req: Request, res: Response) => {
    res
        .type('.html')
        .status(200)
        .send('<h1>hello World!</h1>');
});

// using validation
// http://localhost:3000/users/user1
usersRoute.post(
    '/user1',
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
usersRoute.post(
    '/user2',
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

export default usersRoute;