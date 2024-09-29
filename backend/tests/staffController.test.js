const request = require('supertest');
const app = require('../server'); // Your Express app
const supabase = require('../config/supabase'); // Supabase client for database actions

let garageToken;
let garageId;
let staffId;
let staffAvailabilityId;
let userId;

beforeAll(async () => {
    // Register a user with the "garage" role
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'garage_user@test.com',
        password: 'testpassword',
    });

    if (signUpError) throw new Error('Error signing up user: ' + signUpError.message);

    userId = signUpData.user.id;

    // Set the role to "garage"
    const { error: profileError } = await supabase.from('profiles').insert([{ id: userId, role: 'garage' }]);
    if (profileError) throw new Error('Error setting user role: ' + profileError.message);

    // Log in to get the token for the test
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: 'garage_user@test.com',
        password: 'testpassword',
    });

    if (loginError) throw new Error('Login failed: ' + loginError.message);

    garageToken = loginData.session.access_token;

    // Create a garage for this user
    const { data: garageData, error: garageError } = await supabase
        .from('garages')
        .insert([{ name: 'Test Garage', user_id: userId }])
        .select();

    if (garageError) throw new Error('Error creating garage: ' + garageError.message);

    garageId = garageData[0].id;
});

afterAll(async () => {
    // Clean up the created staff, garage, and user after tests
    if (staffId) await supabase.from('staff').delete().eq('id', staffId);
    if (garageId) await supabase.from('garages').delete().eq('id', garageId);
    if (userId) await supabase.auth.admin.deleteUser(userId); // Ensure Supabase Admin API is used to delete the user
});

describe('Staff Management', () => {

    // Test creating staff
    it('should create a new staff member', async () => {
        const res = await request(app)
            .post('/api/staff/create')
            .set('Authorization', `Bearer ${garageToken}`)
            .send({
                name: 'John Doe',
                garage_id: garageId,
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Staff created');
        expect(res.body).toHaveProperty('staff');
        staffId = res.body.staff.id;
        expect(res.body.staff).toHaveProperty('name', 'John Doe');
        expect(res.body.staff).toHaveProperty('garage_id', garageId);
    });

    // Test getting all staff for a garage
    it('should get all staff for the garage', async () => {
        const res = await request(app)
            .get(`/api/staff/${garageId}`)
            .set('Authorization', `Bearer ${garageToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('staff');
        expect(res.body.staff.length).toBeGreaterThan(0);
    });

    // Test getting a single staff member by ID
    it('should get a single staff member by ID', async () => {
        const res = await request(app)
            .get(`/api/staff/id/${staffId}`)
            .set('Authorization', `Bearer ${garageToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('staff');
        expect(res.body.staff).toHaveProperty('id', staffId);
    });

    // Test updating a staff member
    it('should update a staff member', async () => {
        const res = await request(app)
            .put(`/api/staff/update/${staffId}`)
            .set('Authorization', `Bearer ${garageToken}`)
            .send({
                name: 'Jane Doe',
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Staff updated');
        expect(res.body).toHaveProperty('staff');
        expect(res.body.staff).toHaveProperty('name', 'Jane Doe');
    });

    // Test setting staff availability
    it('should set staff availability', async () => {
        const res = await request(app)
            .post('/api/staff/availability')
            .set('Authorization', `Bearer ${garageToken}`)
            .send({
                staff_id: staffId,
                day_of_week: 1, // Monday
                available_start: '08:00',
                available_end: '17:00',
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Staff availability set');
        expect(res.body).toHaveProperty('availability');
        staffAvailabilityId = res.body.availability.id;
    });

    // Test getting staff availability
    it('should get staff availability', async () => {
        const res = await request(app)
            .get(`/api/staff/availability/${staffId}`)
            .set('Authorization', `Bearer ${garageToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('availability');
        expect(res.body.availability.length).toBeGreaterThan(0);
    });

    // Test deleting a staff member
    it('should delete a staff member', async () => {
        const res = await request(app)
            .delete(`/api/staff/delete/${staffId}`)
            .set('Authorization', `Bearer ${garageToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Staff deleted');
    });
});
