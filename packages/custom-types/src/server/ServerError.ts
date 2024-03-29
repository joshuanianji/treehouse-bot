import axios from 'axios';
import * as i from 'io-ts';
import * as D from 'io-ts/Decoder';
import { sparseType, optional } from 'io-ts-extra';
import { Option, none, fromEither } from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/function';

export const ServerError = sparseType({
    code: i.string,
    title: i.string,
    message: optional(i.string),
    details: optional(i.record(i.string, i.string))
})

export type ServerError = i.TypeOf<typeof ServerError>


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

export const fromDecodeError = (decoderName: string) => (err: D.DecodeError): ServerError => {
    return {
        code: 'DECODE_ERROR',
        title: `Error decoding item ${decoderName}`,
        message: D.draw(err),
    }
}