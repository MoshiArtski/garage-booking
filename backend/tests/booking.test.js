const request = require('supertest');
const supabase = require('../config/supabase');
const app = require('../server');

describe('Booking API Tests', () => {
    let token = null;
    let userId = null;

    // Step 1: Log in before running the tests to get the token
    beforeAll(async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@test.com',
                password: 'test'
            });

        token = res.body.token;
        if (!token) throw new Error('Failed to get token from login');

        const { data: user, error } = await supabase.auth.getUser(token);
        if (error) throw new Error('Failed to get user');
        userId = user.id; // Store the user's UUID
    });

    // Step 2: Test booking creation
    it('should create a booking', async () => {
        const res = await request(app)
            .post('/api/bookings/create')
            .set('Authorization', `Bearer ${token}`) // Use the token from login
            .send({
                user_id: userId,    // Use the logged-in user ID
                item_id: 1,         // Ensure this item exists in your DB
                staff_id: 1,        // Ensure this staff exists in your DB
                booking_date: '2023-12-01',
                booking_time: '09:00',
                duration: 60
            });

        console.log('Response body:', res.body);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Booking created');
    });
});
