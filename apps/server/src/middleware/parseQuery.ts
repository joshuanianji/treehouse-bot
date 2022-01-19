import { NextFunction, RequestHandler } from 'express';
import { pipe } from 'fp-ts/lib/function';
import { fold } from 'fp-ts/lib/Either';
import * as i from 'io-ts'
import { ParamsDictionary, Query } from 'express-serve-static-core'
import { formatValidationErrors } from 'io-ts-reporters'


// * NOTE: Query parsers can NOT be used to parse numbers, that needs lib/parsers.ts's ParseInt
// because I still want to typecheck the query, I store it in `res.locals.query`
// https://github.com/expressjs/express/issues/3472#issuecomment-341820984
export const parseQuery = <T>(decoder: i.Decoder<unknown, T>): RequestHandler<ParamsDictionary, any, any, Query, { query: T }> => (
    req,
    res,
    next: NextFunction,
) => {
    return pipe(
        decoder.decode(req.query),
        fold(
            errors => {
                console.log(formatValidationErrors(errors))
                res.status(400).send({ code: 'Bad Query', status: 'error', error: formatValidationErrors(errors) });
            },
            parsedQuery => {
                res.locals.query = parsedQuery;
                next();
            }
        ),
    );
};
