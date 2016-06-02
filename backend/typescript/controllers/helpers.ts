import {Response, Request} from 'express';
import {IResponse, ErrorResponse} from '../../../commons/RamAPI';
import * as _ from 'lodash';

export function given<T>(req:Request):Promise<Request> {
    'use strict';
    return new Promise<Request>((resolve, reject) => {
        resolve(req);
    });
}

export function validate(executor:(req:Request) => void) {
    'use strict';
    return (req:Request):Request => {
        executor(req);
        const errors = req.validationErrors(false) as { msg: string }[];
        if (errors) {
            const errorMsgs = errors.map((e) => e.msg);
            return new Promise<Request>((resolve, reject) => {
                reject(errorMsgs);
            });
        } else {
            return req;
        }
    };
}

export function sendResource<T>(res:Response) {
    'use strict';
    return (doc:T):T => {
        if (doc) {
            res.status(200);
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(doc, null, 4));
        }
        return doc;
    };
}

export function sendList<T>(res:Response) {
    'use strict';
    return (results:T[]):T[] => {
        if (results) {
            res.status(200);
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(results, null, 4));
        }
        return results;
    };
}

// @deprecated
export function sendDocument<T>(res:Response) {
    'use strict';
    return (doc:T):T => {
        if (doc) {
            const response:IResponse<T> = {
                data: doc
            };
            res.status(200);
            res.json(response);
        }
        return doc;
    };
}

type ValidationError = {
    errors: { [index: string]: ValidationError };
    message: string;
}

export function sendError<T>(res:Response) {
    'use strict';
    return (error:string | Error | ValidationError | string[]) => {
        switch (error.constructor.name) {
            case 'Array':
                res.status(400);
                res.json(new ErrorResponse(error as string[]));
                break;
            case 'String':
                res.status(500);
                res.json(new ErrorResponse(error as string));
                break;
            case 'MongooseError':
                res.status(400);
                res.json(new ErrorResponse(
                    _.values<string>(_.mapValues((error as ValidationError).errors, (v) => v.message))
                ));
                break;
            case 'Error':
                res.status(500);
                res.json(new ErrorResponse((error as Error).message));
                break;
            default:
                res.status(500);
                res.json(new ErrorResponse(error.toString()));
                break;
        }
    };
}

export function sendNotFoundError<T>(res:Response) {
    'use strict';
    return (doc:T):T => {
        if (!doc) {
            res.status(404);
            res.json(new ErrorResponse('Can\'t find the requested resource.'));
        }
        return doc;
    };
}