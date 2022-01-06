import { parseBody } from './parseBody'
import { NextFunction, Request, Response } from 'express';
import * as i from 'io-ts'

const testTypes = i.type({
    name: i.string,
    age: i.number,
})

// https://javascript.plainenglish.io/how-to-unit-test-express-middleware-typescript-jest-c6a7ad166e74
describe('parseBody middleware', () => {
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

    test('testTypes decodes correctly', async () => {
        const badBody = {
            name: 'John',
            age: '30'
        };
        const goodBody = {
            name: 'John',
            age: 30
        };
        const missingFields = {
            name: 'John'
        }
        expect(testTypes.decode(goodBody)._tag).toEqual('Right');
        expect(testTypes.decode(badBody)._tag).toEqual('Left');
        expect(testTypes.decode(missingFields)._tag).toEqual('Left');
    })

    test('With the bad type', async () => {
        const badBody = {
            name: 'John',
            age: '30'
        };
        mockRequest = { body: badBody }
        parseBody(testTypes)(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(nextFunction).toBeCalledTimes(0); // expect error
        expect(mockResponse.status).toHaveBeenCalled();
        expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    test('With correct type', async () => {
        const goodBody = {
            name: 'John',
            age: 30
        }
        mockRequest = { body: goodBody }

        parseBody(testTypes)(mockRequest as Request, mockResponse as Response, nextFunction);
        expect(nextFunction).toBeCalled();
        expect(mockResponse.status).toBeCalledTimes(0);
        expect(mockResponse.send).toHaveBeenCalledTimes(0);

    });

    test('With missing field', async () => {
        const badBody = {
            name: 'John',
        }
        mockRequest = { body: badBody }
        parseBody(testTypes)(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(nextFunction).toBeCalledTimes(0); // expect error
        expect(mockResponse.status).toHaveBeenCalled();
        expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
});
