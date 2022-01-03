import { request } from "../helper";


describe('Root route', () => {
    it('should return 200 OK', () => {
        return request
            .get('/')
            .expect(200);
    });
})
