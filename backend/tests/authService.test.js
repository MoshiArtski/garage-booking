const request = require('supertest');
const app = require('../server'); // Ensure this points to your server file

describe('Auth and Staff Management Tests', () => {

    // Test for customer login
    it('should successfully log in the customer account', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'customer@garage.com',
                password: 'test123'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Logged in successfully');
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('role', 'customer');
    });

    // Test for garage login
    it('should successfully log in the garage account', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'garage@test.com',
                password: 'test123'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Logged in successfully');
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('role', 'garage');

        // Save the token for the following requests
        garageToken = res.body.token;
    });

    // Test for invalid credentials
    it('should return 401 for invalid credentials', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'nonexistent@example.com',
                password: 'wrongpassword'
            });

        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty('error', 'Invalid credentials');
    });

    // Test for creating a staff member
    it('should create a new staff member with the garage account', async () => {
        const res = await request(app)
            .post('/api/staff/create')
            .set('Authorization', `Bearer ${garageToken}`) // Use the token from the login test
            .send({
                garage_id: 'garage123',
                name: 'Staff Member 1'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Staff created');
        expect(res.body.data[0]).toHaveProperty('garage_id', 'garage123');
        expect(res.body.data[0]).toHaveProperty('name', 'Staff Member 1');

        // Save staff ID for the next test
        staffId = res.body.data[0].id;
    });

    // Test for setting staff availability
    it('should set availability for a staff member', async () => {
        const res = await request(app)
            .post('/api/staff/availability')
            .set('Authorization', `Bearer ${garageToken}`)
            .send({
                staff_id: staffId,  // Use the staff ID from the previous test
                day_of_week: 1,     // Monday
                available_start: '08:00',
                available_end: '17:00'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Staff availability set');
        expect(res.body.data[0]).toHaveProperty('staff_id', staffId);
        expect(res.body.data[0]).toHaveProperty('available_start', '08:00');
        expect(res.body.data[0]).toHaveProperty('available_end', '17:00');
    });
});
