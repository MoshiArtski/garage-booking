const request = require('supertest');
const app = require('../server'); // The main Express app

describe('Service Routes', () => {
    it('should create a new service', async () => {
        const res = await request(app)
            .post('/api/services')
            .send({
                name: 'Oil Change',
                category: 'MOT',
                timeRequired: 30,
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body.name).toBe('Oil Change');
    });

    it('should get all services', async () => {
        const res = await request(app).get('/api/services');
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});
