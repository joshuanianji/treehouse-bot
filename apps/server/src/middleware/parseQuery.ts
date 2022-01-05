import { RequestHandler } from 'express';
import { pipe } from 'fp-ts/lib/function';
import { fold } from 'fp-ts/lib/Either';
import * as i from 'io-ts'
import { ParamsDictionary, Query } from 'express-serve-static-core'
import { formatValidationErrors } from 'io-ts-reporters'


export const parseQuery = <T>(decoder: i.Decoder<unknown, T>): RequestHandler<ParamsDictionary, any, any, Query extends T ? Query & T : Query> => (
    req,
    res,
    next,
) => {
    return pipe(
        decoder.decode(req.query),
        fold(
            errors => res.status(400).send({ code: 'BadArgument', status: 'error', error: formatValidationErrors(errors) }),
            () => next(),
        ),
    );
};
