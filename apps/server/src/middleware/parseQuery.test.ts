import { parseQuery } from './parseQuery'
import { NextFunction, Request, Response } from 'express';
import * as i from 'io-ts'
import { sparseType, optional } from 'io-ts-extra'

// Optional props:
// https://github.com/gcanti/io-ts/issues/56#issuecomment-922388563
const testTypes = sparseType({
    name: i.string,
    list: i.array(i.string),
    nullable: optional(i.string)
})
type TestType = i.TypeOf<typeof testTypes>

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
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('Query: testTypes decodes correctly', async () => {
        const badQuery = {
            name: 'John',
            list: '20'
        };
        const goodQueryPartial = {
            name: 'John',
            list: ['20'],
        };
        const goodQueryNull: TestType = {
            name: 'John',
            list: ['30', '40'],
            nullable: null,
        };
        const goodQueryFull = {
            name: 'John',
            list: ['30', '40'],
            nullable: 'hello'
        }
        const missingFields = {
            list: 'John'
        }
        expect(testTypes.decode(goodQueryPartial)._tag).toEqual('Right');
        expect(testTypes.decode(goodQueryNull)._tag).toEqual('Right');
        expect(testTypes.decode(goodQueryFull)._tag).toEqual('Right');
        expect(testTypes.decode(badQuery)._tag).toEqual('Left');
        expect(testTypes.decode(missingFields)._tag).toEqual('Left');
    })

    test('Query: With the bad query', async () => {
        const badQuery = {
            name: 'John',
            list: '30'
        };
        mockRequest = { query: badQuery }
        parseQuery(testTypes)(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(nextFunction).toBeCalledTimes(0); // expect error
        expect(mockResponse.status).toHaveBeenCalled();
        expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    test('Query: With correct type', async () => {
        const goodQuery = {
            name: 'John',
            age: '30',
            list: ['30', '40']
        }
        mockRequest = { query: goodQuery }

        parseQuery(testTypes)(mockRequest as Request, mockResponse as Response, nextFunction);
        expect(nextFunction).toBeCalled();
        expect(mockResponse.status).toBeCalledTimes(0);
        expect(mockResponse.send).toHaveBeenCalledTimes(0);

    });

    test('Query: With missing field', async () => {
        const badQuery = {
            name: 'John',
        }
        mockRequest = { query: badQuery }
        parseQuery(testTypes)(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(nextFunction).toBeCalledTimes(0); // expect error
        expect(mockResponse.status).toHaveBeenCalled();
        expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
});
