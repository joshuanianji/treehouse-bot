import { ParamsDictionary, Query } from 'express-serve-static-core'
import { NextFunction, Request, Response } from 'express';
import { sparseType, optional } from 'io-ts-extra';
import { parseQuery } from './parseQuery';
import * as i from 'io-ts';
import { pipe } from 'fp-ts/lib/function'


// Optional props:
// https://github.com/gcanti/io-ts/issues/56#issuecomment-922388563
const testTypes = sparseType({
    name: i.string,
    list: i.array(i.string),
    nullable: optional(i.string),
    int: optional(i.number),
})
type TestType = i.TypeOf<typeof testTypes>

// Le type hacking has arrived B)
interface CustomRes<T> extends Response<
    ParamsDictionary,
    { query: T }> { }

interface CustomReq<T> extends Request<
    ParamsDictionary,
    any,
    any,
    Query,
    { query: T }> { }

const BAD = {
    badQuery: {
        name: 'John',
        list: '20'
    },
    missingFields: {
        list: 'John'
    }
}

const GOOD: Record<string, TestType> = {
    goodQueryPartial: {
        name: 'John',
        list: ['20'],
    },
    goodQueryNull: {
        name: 'John',
        list: ['30', '40'],
        nullable: null as (string | null), // maybe I should store test cases into GOOD and BAD to prevent this type of weird type hack
        int: 20
    },
    goodQueryFull: {
        name: 'John',
        list: ['30', '40'],
        nullable: 'hello',
        int: 20
    },
}

// https://javascript.plainenglish.io/how-to-unit-test-express-middleware-typescript-jest-c6a7ad166e74
describe('parseQuery middleware', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction = jest.fn();

    beforeEach(() => {
        mockRequest = {};
        // https://stackoverflow.com/q/60001881
        // Remember the mockReturnValue
        mockResponse = {
            json: jest.fn().mockReturnValue(mockResponse),
            status: jest.fn().mockReturnValue(mockResponse),
            send: jest.fn().mockReturnValue(mockResponse),
            locals: {}
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('Query: testTypes decodes correctly', async () => {
        expect(testTypes.decode(GOOD.goodQueryPartial)._tag).toEqual('Right');
        expect(testTypes.decode(GOOD.goodQueryNull)._tag).toEqual('Right');
        expect(testTypes.decode(GOOD.goodQueryFull)._tag).toEqual('Right');
        expect(testTypes.decode(BAD.badQuery)._tag).toEqual('Left');
        expect(testTypes.decode(BAD.missingFields)._tag).toEqual('Left');
    })

    test('Query: Works with the bad query', async () => {
        mockRequest = { query: querify(BAD.badQuery) }
        parseQuery(testTypes)(mockRequest as CustomReq<TestType>, mockResponse as CustomRes<TestType>, nextFunction);

        expect(nextFunction).toBeCalledTimes(0); // expect error
        expect(mockResponse.status).toHaveBeenCalled();
        expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    test('Query: With Good Query Null', async () => {
        mockRequest = { query: querify(GOOD.goodQueryNull) }
        parseQuery(testTypes)(mockRequest as CustomReq<TestType>, mockResponse as CustomRes<TestType>, nextFunction);
        expect(nextFunction).toBeCalledTimes(1);
        expect(mockResponse.status).toBeCalledTimes(0);
        expect(mockResponse.send).toHaveBeenCalledTimes(0);
        expect(mockResponse.locals.query).toEqual(GOOD.goodQueryNull);
    });

    test('Query: With Good Query Full', async () => {
        mockRequest = { query: querify(GOOD.goodQueryFull) }
        parseQuery(testTypes)(mockRequest as CustomReq<TestType>, mockResponse as CustomRes<TestType>, nextFunction);
        expect(nextFunction).toBeCalledTimes(1);
        expect(mockResponse.status).toBeCalledTimes(0);
        expect(mockResponse.send).toHaveBeenCalledTimes(0);
        expect(mockResponse.locals.query).toEqual(GOOD.goodQueryFull);
    });

    test('Query: With Good Query Partial', async () => {
        mockRequest = { query: querify(GOOD.goodQueryPartial) }
        parseQuery(testTypes)(mockRequest as CustomReq<TestType>, mockResponse as CustomRes<TestType>, nextFunction);
        expect(nextFunction).toBeCalledTimes(1);
        expect(mockResponse.status).toBeCalledTimes(0);
        expect(mockResponse.send).toHaveBeenCalledTimes(0);
        expect(mockResponse.locals.query).toEqual(GOOD.goodQueryPartial);
    });

    test('Query: With missing field', async () => {
        mockRequest = { query: querify(BAD.badQuery) }
        parseQuery(testTypes)(mockRequest as CustomReq<TestType>, mockResponse as CustomRes<TestType>, nextFunction);

        expect(nextFunction).toBeCalledTimes(0); // expect error
        expect(mockResponse.status).toHaveBeenCalled();
        expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
});

// to "stringify" the query
// this is since we might have number that do not work with the ParsedQs type
const querify = <T>(a: T) => {
    return pipe(
        JSON.stringify(a),
        JSON.parse
    )
}