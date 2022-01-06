import axios from 'axios';
import * as i from 'io-ts';
import { sparseType, optional } from 'io-ts-extra';
import { Option, none, fromEither } from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/function';
import { left } from 'fp-ts/lib/Separated';

const ServerError = sparseType({
    code: i.string,
    title: i.string,
    message: optional(i.string),
})

type ServerError = i.TypeOf<typeof ServerError>


// checks if the error is an instance of the server error
export const getServerError = (error: unknown): Option<ServerError> => {
    if (!axios.isAxiosError(error)) {
        return none;
    }

    if (!error.response) {
        return none;
    }

    const { data } = error.response;

    return pipe(
        ServerError.decode(data),
        fromEither
    )
}