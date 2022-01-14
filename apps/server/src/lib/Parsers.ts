import * as i from 'io-ts';

// extra io-ts stuff
// for example, the parseQuery middleware with any type of number in the query type will result in an error,
// since io-ts thinks it has to be a string

// this basically represents a number transforming from a string
// https://github.com/gcanti/io-ts/blob/master/index.md#piping
const ParseInt = new i.Type<number, string, string>(
    'ParseInt',
    i.number.is,
    (s, c) => {
        const n = parseInt(s)
        return isNaN(n) ? i.failure(s, c) : i.success(n)
    },
    String
)

export const IntFromString = i.string.pipe(ParseInt, 'NumberFromString')
