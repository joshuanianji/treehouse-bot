import { RequestHandler } from 'express';
import { pipe } from 'fp-ts/lib/function';
import { fold } from 'fp-ts/lib/Either';
import * as i from 'io-ts'
import { ParamsDictionary } from 'express-serve-static-core'
import { formatValidationErrors } from 'io-ts-reporters'


// https://blog.jiayihu.net/how-to-validate-express-requests-using-io-ts/

export const parseBody = <T>(decoder: i.Decoder<unknown, T>): RequestHandler<ParamsDictionary, any, T> => (
    req,
    res,
    next,
) => {
    return pipe(
        decoder.decode(req.body),
        fold(
            errors => res.status(400).send({ code: 'BadArgument', status: 'error', error: formatValidationErrors(errors) }),
            () => next(),
        ),
    );
};

