import * as TE from 'fp-ts/TaskEither';
import * as i from 'io-ts';
import { pipe } from 'fp-ts/lib/function';
import { server } from 'custom-types';
import { formatValidationErrors } from 'io-ts-reporters';
import axios, { AxiosResponse } from 'axios';


const getResponse = (url: string): TE.TaskEither<server.ServerError, AxiosResponse> => {
    console.log('getResponse', url);
    return TE.tryCatchK(axios.get, (reason) => ({
        code: 'SERVER_ERROR',
        title: 'Unknown Error fetching response',
        message: JSON.stringify(reason)
    }))(url)
}

const checkResponse = (res: AxiosResponse): TE.TaskEither<server.ServerError, AxiosResponse> => {
    console.log('checkResponse');
    if (res.status >= 200 && res.status < 300) {
        return TE.right(res);
    }
    return TE.left({
        code: 'SERVER_ERROR',
        title: 'Unknown Error fetching response',
        message: `${res.status} ${res.statusText}`,
    });
}

/**
 * Fetches the response, and decodes it
 * Assume the response is a JSON format that needs to be accessed via `.data`
 * 
 * @param url the URL to fetch (absolute)
 * @param decoder the io-ts decode to decode the response
 * @returns TaskEither<Error, T>
 */
export const fetchAndDecode = <T>(url: string, decoder: i.Decoder<unknown, T>): TE.TaskEither<server.ServerError, T> => {
    return pipe(
        TE.bindTo('res')(getResponse(url)),
        TE.bind('decoded', ({ res }) => {
            return pipe(
                decoder.decode(res.data.data),
                TE.fromEither,
                // without the explicit types below, i'll get an error for some reason...
                TE.mapLeft<i.ValidationError[], server.ServerError>((e) => ({
                    code: 'PARSE_ERROR',
                    title: `Error parsing ${decoder.name}`,
                    message: formatValidationErrors(e).join('\n'),
                }))
            )
        }),
        TE.map(({ decoded }) => decoded)
    )
}