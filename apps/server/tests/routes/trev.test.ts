import { request } from "../helper";


describe('/trevimg route', () => {
    it('Should default to Hello World', async () => {
        const test = await request.get('/trev?text=')
            .expect(200);

        expect(test.body.type).toBe('base64');
        expect(test.body.data).toBeDefined();
        expect(test.body.width).toBeDefined();
        expect(test.body.height).toBeDefined();
        expect(test.body.ext).toBe('jpg');
        // expect(test.body.text).toBe('Hello World!');
    }, 10000);
    it('Should run on input `hi`', async () => {
        const test = await request.get('/trev?text=hi')
            .expect(200);

        expect(test.body.type).toBe('base64');
        expect(test.body.data).toBeDefined();
        expect(test.body.width).toBeDefined();
        expect(test.body.height).toBeDefined();
        expect(test.body.ext).toBe('jpg');
        expect(test.body.text).toBe('hi');
    }, 10000)
})
