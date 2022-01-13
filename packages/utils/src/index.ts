import * as TE from 'fp-ts/TaskEither';
import * as i from 'io-ts';
import { pipe } from 'fp-ts/lib/function';
import { ServerError } from 'custom-types';
import { formatValidationErrors } from 'io-ts-reporters';
import axios, { AxiosResponse, AxiosError } from 'axios';


const getResponse = (url: string): TE.TaskEither<AxiosError, AxiosResponse> => {
    console.log('getResponse', url);
    return TE.tryCatchK(axios.get, (reason) => {
        console.log('Error:', reason)
        return reason as AxiosError
    })(url)
}


export const defaultAxiosErrorMap = (error: AxiosError): ServerError => {
    console.log('defaultAxiosErrorMap');
    return {
        code: `${error.code}_AXIOS_ERROR`,
        title: error.message,
        details: error.response?.data
    }
}


// the type of a function that checks Axios Responses
export type MapAxiosError = (reason: AxiosError) => ServerError;


/**
 * Fetches the response, and decodes it
 * Assume the response is a JSON format that needs to be accessed via `.data`
 * 
 * @param url the URL to fetch (absolute)
 * @param decoder the io-ts decode to decode the response
 * @param axiosErrorMap An optional function to convert AxiosErrors to serverErrors
 * @returns TaskEither<Error, T>
 */
export const fetchAndDecode = <T>(url: string, decoder: i.Decoder<unknown, T>, axiosErrorMap?: MapAxiosError): TE.TaskEither<ServerError, T> => {
    return pipe(
        TE.bindTo('res')(getResponse(url)),
        TE.mapLeft(axiosErrorMap || defaultAxiosErrorMap),
        TE.bind('decoded', ({ res }) => {
            return pipe(
                decoder.decode(res.data.data),
                TE.fromEither,
                // without the explicit types below, i'll get an error for some reason...
                TE.mapLeft<i.ValidationError[], ServerError>((e) => ({
                    code: 'PARSE_ERROR',
                    title: `Error parsing ${decoder.name} in fetchAndDecode`,
                    message: formatValidationErrors(e).join('\n'),
                }))
            )
        }),
        TE.map(({ decoded }) => decoded)
    )
}