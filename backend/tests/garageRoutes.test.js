const request = require('supertest');
const app = require('../server');  // Your express app
const supabase = require('../config/supabase');  // Your actual Supabase instance

let garageToken;
let garageId;
let garageUserId;

beforeAll(async () => {
    // Register a user with the "garage" role
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'garage_user@test.com',
        password: 'testpassword',
    });

    if (signUpError) throw new Error('Error signing up user for test: ' + signUpError.message);

    garageUserId = signUpData.user.id;

    // Set the role to "garage" in the profiles table
    const { error: profileError } = await supabase.from('profiles').insert([{ id: garageUserId, role: 'garage' }]);

    if (profileError) throw new Error('Error setting user role: ' + profileError.message);

    // Log in to get the token for the test
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: 'garage_user@test.com',
        password: 'testpassword',
    });

    if (loginError) throw new Error('Login failed: ' + loginError.message);

    garageToken = loginData.session.access_token;
});

afterAll(async () => {
    // Clean up the garage user and created garage after tests
    if (garageId) {
        await supabase.from('garages').delete().eq('user_id', garageUserId);  // Delete the garage by user_id
    }

    if (garageUserId) {
        await supabase.auth.admin.deleteUser(garageUserId);  // Correctly call deleteUser from Supabase admin API
    }
});

describe('POST /api/garages/create', () => {
    it('should create a new garage for an authenticated garage user', async () => {
        const res = await request(app)
            .post('/api/garages/create')
            .set('Authorization', `Bearer ${garageToken}`)  // Pass the Supabase token
            .send({
                name: 'Test Garage',
            });

        // Check if the response is 200 OK
        expect(res.statusCode).toEqual(200);

        // Check if the response contains the message and garage data
        expect(res.body).toHaveProperty('message', 'Garage created');
        expect(res.body).toHaveProperty('garage');
        expect(res.body.garage).toHaveProperty('name', 'Test Garage');
        expect(res.body.garage).toHaveProperty('user_id', expect.any(String));  // Ensure it has a valid user_id

        // Save the created garage ID for cleanup
        garageId = res.body.garage.id;
    });

    it('should deny access to users without the garage role', async () => {
        // Sign up a new user without the "garage" role
        const { data: customerData } = await supabase.auth.signUp({
            email: 'customer_user@test.com',
            password: 'testpassword',
        });

        const customerUserId = customerData.user.id;

        // Set the customer role
        await supabase.from('profiles').insert([{ id: customerUserId, role: 'customer' }]);

        // Log in to get the customer token
        const { data: customerLoginData } = await supabase.auth.signInWithPassword({
            email: 'customer_user@test.com',
            password: 'testpassword',
        });

        const customerToken = customerLoginData.session.access_token;

        // Try to create a garage with a customer role
        const res = await request(app)
            .post('/api/garages/create')
            .set('Authorization', `Bearer ${customerToken}`)
            .send({
                name: 'Customer Attempt Garage',
            });

        // Expect forbidden
        expect(res.statusCode).toEqual(403);
        expect(res.body).toHaveProperty('error', 'Access denied. Must be garage');

        // Clean up the customer user after test
        await supabase.auth.admin.deleteUser(customerUserId);  // Correctly call deleteUser from Supabase admin API
    });
});
