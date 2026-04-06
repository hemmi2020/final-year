const axios = require('axios');
const BASE = 'http://localhost:5000/api';
let TOKEN = '';
let USER_ID = '';
let TRIP_ID = '';
let GROUP_ID = '';
let LOCATION_ID = '';
let passed = 0;
let failed = 0;
const EMAIL = `testall_${Date.now()}@travelfy.com`;

async function test(name, fn) {
    try {
        await fn();
        passed++;
        console.log(`  ✅ ${name}`);
    } catch (e) {
        failed++;
        const msg = e.response?.data?.error || e.response?.data?.errors?.[0] || e.message;
        console.log(`  ❌ ${name} → ${msg}`);
    }
}

function assert(condition, msg) {
    if (!condition) throw new Error(msg || 'Assertion failed');
}

const auth = () => ({ headers: { Authorization: `Bearer ${TOKEN}` } });

async function run() {
    console.log('\n═══════════════════════════════════════');
    console.log('  TRAVELFY AI — COMPREHENSIVE API TEST');
    console.log('═══════════════════════════════════════\n');

    // ─── 1. HEALTH CHECK ───
    console.log('📡 1. HEALTH CHECK');
    await test('GET /api/health returns ok', async () => {
        const { data } = await axios.get(`${BASE}/health`);
        assert(data.success === true);
        assert(data.data.status === 'ok');
    });

    // ─── 2. AUTH — REGISTER ───
    console.log('\n🔐 2. AUTHENTICATION');
    await test('POST /auth/register — new user', async () => {
        const { data } = await axios.post(`${BASE}/auth/register`, {
            name: 'Test All User', email: EMAIL, password: 'test123'
        });
        assert(data.success === true);
        assert(data.data.user.name === 'Test All User');
        assert(data.data.user.email === EMAIL.toLowerCase());
        assert(data.data.token.length > 20);
        TOKEN = data.data.token;
        USER_ID = data.data.user.id;
    });

    await test('POST /auth/register — duplicate email rejected', async () => {
        try {
            await axios.post(`${BASE}/auth/register`, {
                name: 'Dup', email: EMAIL, password: 'test123'
            });
            throw new Error('Should have failed');
        } catch (e) {
            assert(e.response.status === 400);
        }
    });

    await test('POST /auth/register — validation: missing name', async () => {
        try {
            await axios.post(`${BASE}/auth/register`, { email: 'x@x.com', password: '123456' });
            throw new Error('Should have failed');
        } catch (e) {
            assert(e.response.status === 400);
        }
    });

    await test('POST /auth/register — validation: short password', async () => {
        try {
            await axios.post(`${BASE}/auth/register`, { name: 'X', email: 'y@y.com', password: '12' });
            throw new Error('Should have failed');
        } catch (e) {
            assert(e.response.status === 400);
        }
    });

    await test('POST /auth/register — validation: invalid email', async () => {
        try {
            await axios.post(`${BASE}/auth/register`, { name: 'X', email: 'notanemail', password: '123456' });
            throw new Error('Should have failed');
        } catch (e) {
            assert(e.response.status === 400);
        }
    });

    // ─── AUTH — LOGIN ───
    await test('POST /auth/login — correct credentials', async () => {
        const { data } = await axios.post(`${BASE}/auth/login`, { email: EMAIL, password: 'test123' });
        assert(data.success === true);
        assert(data.data.token.length > 20);
        TOKEN = data.data.token;
    });

    await test('POST /auth/login — wrong password', async () => {
        try {
            await axios.post(`${BASE}/auth/login`, { email: EMAIL, password: 'wrongpass' });
            throw new Error('Should have failed');
        } catch (e) {
            assert(e.response.status === 401);
        }
    });

    await test('POST /auth/login — non-existent email', async () => {
        try {
            await axios.post(`${BASE}/auth/login`, { email: 'nobody@nowhere.com', password: 'test123' });
            throw new Error('Should have failed');
        } catch (e) {
            assert(e.response.status === 401);
        }
    });

    // ─── AUTH — PROFILE ───
    await test('GET /auth/profile — authenticated', async () => {
        const { data } = await axios.get(`${BASE}/auth/profile`, auth());
        assert(data.success === true);
        assert(data.data.user.email === EMAIL.toLowerCase());
    });

    await test('GET /auth/profile — no token rejected', async () => {
        try {
            await axios.get(`${BASE}/auth/profile`);
            throw new Error('Should have failed');
        } catch (e) {
            assert(e.response.status === 401);
        }
    });

    await test('GET /auth/profile — invalid token rejected', async () => {
        try {
            await axios.get(`${BASE}/auth/profile`, { headers: { Authorization: 'Bearer faketoken123' } });
            throw new Error('Should have failed');
        } catch (e) {
            assert(e.response.status === 401);
        }
    });

    // ─── AUTH — LOGOUT ───
    await test('POST /auth/logout — authenticated', async () => {
        const { data } = await axios.post(`${BASE}/auth/logout`, {}, auth());
        assert(data.success === true);
    });

    // ─── 3. USER PROFILE & PREFERENCES ───
    console.log('\n👤 3. USER PROFILE & PREFERENCES');
    await test('GET /users/profile — get profile', async () => {
        const { data } = await axios.get(`${BASE}/users/profile`, auth());
        assert(data.success === true);
        assert(data.data.name === 'Test All User');
    });

    await test('PUT /users/profile — update name', async () => {
        const { data } = await axios.put(`${BASE}/users/profile`, { name: 'Updated Name' }, auth());
        assert(data.success === true);
    });

    await test('PUT /users/preferences — set dietary + budget + currency', async () => {
        const { data } = await axios.put(`${BASE}/users/preferences`, {
            dietary: ['halal', 'vegan'],
            budget: 'moderate',
            preferredCurrency: 'PKR',
            temperatureUnit: 'metric',
            interests: ['history', 'food'],
            travelStyle: 'family'
        }, auth());
        assert(data.success === true);
    });

    await test('PUT /users/preferences — invalid budget rejected', async () => {
        try {
            await axios.put(`${BASE}/users/preferences`, { budget: 'ultra-luxury' }, auth());
            throw new Error('Should have failed');
        } catch (e) {
            assert(e.response.status === 400);
        }
    });

    await test('GET /users/profile — verify preferences saved', async () => {
        const { data } = await axios.get(`${BASE}/users/profile`, auth());
        assert(data.data.preferences.dietary.includes('halal'));
        assert(data.data.preferences.preferredCurrency === 'PKR');
        assert(data.data.preferences.travelStyle === 'family');
    });

    // ─── 4. TRIPS CRUD ───
    console.log('\n✈️  4. TRIPS CRUD');
    await test('POST /trips — create trip', async () => {
        const { data } = await axios.post(`${BASE}/trips`, {
            title: 'Tokyo Adventure', destination: 'Tokyo', status: 'draft'
        }, auth());
        assert(data.success === true);
        assert(data.data.title === 'Tokyo Adventure');
        TRIP_ID = data.data._id;
    });

    await test('POST /trips — validation: missing title', async () => {
        try {
            await axios.post(`${BASE}/trips`, { destination: 'Paris' }, auth());
            throw new Error('Should have failed');
        } catch (e) {
            assert(e.response.status === 400);
        }
    });

    await test('GET /trips — list all trips', async () => {
        const { data } = await axios.get(`${BASE}/trips`, auth());
        assert(data.success === true);
        assert(Array.isArray(data.data));
        assert(data.data.length >= 1);
    });

    await test('GET /trips/:id — get single trip', async () => {
        const { data } = await axios.get(`${BASE}/trips/${TRIP_ID}`, auth());
        assert(data.success === true);
        assert(data.data.destination === 'Tokyo');
    });

    await test('PUT /trips/:id — update trip', async () => {
        const { data } = await axios.put(`${BASE}/trips/${TRIP_ID}`, {
            title: 'Tokyo Family Trip', status: 'planned'
        }, auth());
        assert(data.success === true);
        assert(data.data.title === 'Tokyo Family Trip');
    });

    await test('GET /trips — no auth rejected', async () => {
        try {
            await axios.get(`${BASE}/trips`);
            throw new Error('Should have failed');
        } catch (e) {
            assert(e.response.status === 401);
        }
    });

    // ─── 5. EXTERNAL APIs ───
    console.log('\n🌍 5. EXTERNAL APIs (Weather, Currency, Geocode, Places)');
    await test('GET /external/geocode?q=Tokyo — geocode city', async () => {
        const { data } = await axios.get(`${BASE}/external/geocode?q=Tokyo`);
        assert(data.success === true);
        assert(Math.abs(data.data.lat - 35.68) < 1);
        assert(Math.abs(data.data.lng - 139.76) < 1);
    });

    await test('GET /external/geocode?q=Istanbul — geocode another city', async () => {
        const { data } = await axios.get(`${BASE}/external/geocode?q=Istanbul`);
        assert(data.success === true);
        assert(Math.abs(data.data.lat - 41.0) < 1);
    });

    await test('GET /external/geocode?q=xyznonexistent — not found', async () => {
        try {
            await axios.get(`${BASE}/external/geocode?q=xyznonexistent123456`);
            throw new Error('Should have failed');
        } catch (e) {
            assert(e.response.status === 404);
        }
    });

    await test('GET /external/weather?lat=35.68&lng=139.76 — Tokyo weather', async () => {
        const { data } = await axios.get(`${BASE}/external/weather?lat=35.68&lng=139.76`);
        assert(data.success === true);
        assert(typeof data.data.temp === 'number');
        assert(typeof data.data.description === 'string');
        assert(data.data.units === 'metric');
    });

    await test('GET /external/weather — missing params rejected', async () => {
        try {
            await axios.get(`${BASE}/external/weather`);
            throw new Error('Should have failed');
        } catch (e) {
            assert(e.response.status === 400);
        }
    });

    await test('GET /external/forecast?lat=48.85&lng=2.35&days=3 — Paris forecast', async () => {
        const { data } = await axios.get(`${BASE}/external/forecast?lat=48.85&lng=2.35&days=3`);
        assert(data.success === true);
        assert(Array.isArray(data.data));
        assert(data.data.length > 0);
    });

    await test('GET /external/currency?from=USD&to=PKR — exchange rate', async () => {
        const { data } = await axios.get(`${BASE}/external/currency?from=USD&to=PKR`);
        assert(data.success === true);
        assert(data.data.rate > 200);
        assert(data.data.from === 'USD');
        assert(data.data.to === 'PKR');
    });

    await test('GET /external/currency?from=USD&to=EUR&amount=100 — convert amount', async () => {
        const { data } = await axios.get(`${BASE}/external/currency?from=USD&to=EUR&amount=100`);
        assert(data.success === true);
        assert(data.data.convertedAmount > 0);
        assert(data.data.convertedAmount < 100); // EUR < USD
    });

    await test('GET /external/currency?from=JPY&to=USD — JPY to USD', async () => {
        const { data } = await axios.get(`${BASE}/external/currency?from=JPY&to=USD`);
        assert(data.success === true);
        assert(data.data.rate < 1); // JPY is much less than USD
    });

    await test('GET /external/places?query=restaurant&lat=35.68&lng=139.76 — search places', async () => {
        const { data } = await axios.get(`${BASE}/external/places?query=restaurant&lat=35.68&lng=139.76&type=restaurant`);
        assert(data.success === true);
        assert(Array.isArray(data.data));
    });

    await test('GET /external/attractions?lat=48.85&lng=2.35 — Paris attractions', async () => {
        const { data } = await axios.get(`${BASE}/external/attractions?lat=48.85&lng=2.35`);
        assert(data.success === true);
        assert(Array.isArray(data.data));
    });

    // ─── 5b. PREFERENCE-AWARE WEATHER (authenticated) ───
    await test('GET /external/weather (authenticated) — uses user temp unit', async () => {
        const { data } = await axios.get(`${BASE}/external/weather?lat=35.68&lng=139.76`, auth());
        assert(data.success === true);
        assert(data.data.units === 'metric'); // user set metric
    });

    // ─── 6. AI CHAT ───
    console.log('\n🤖 6. AI CHAT');
    await test('POST /chat — anonymous chat (no auth)', async () => {
        const { data } = await axios.post(`${BASE}/chat`, { message: 'What are good places in Tokyo?' });
        assert(data.success === true);
        assert(data.data.message.length > 50);
    });

    await test('POST /chat — authenticated chat (with preferences)', async () => {
        const { data } = await axios.post(`${BASE}/chat`, { message: 'Suggest halal restaurants in Istanbul' }, auth());
        assert(data.success === true);
        assert(data.data.message.length > 50);
    });

    await test('POST /chat — empty message rejected', async () => {
        try {
            await axios.post(`${BASE}/chat`, { message: '' });
            throw new Error('Should have failed');
        } catch (e) {
            assert(e.response.status === 400);
        }
    });

    await test('POST /chat — no body rejected', async () => {
        try {
            await axios.post(`${BASE}/chat`, {});
            throw new Error('Should have failed');
        } catch (e) {
            assert(e.response.status === 400);
        }
    });

    // ─── 7. LOCATIONS & REVIEWS ───
    console.log('\n📍 7. LOCATIONS & REVIEWS');
    await test('POST /locations — save a location', async () => {
        const { data } = await axios.post(`${BASE}/locations`, {
            name: 'Senso-ji Temple', destination: 'Tokyo',
            coordinates: { lat: 35.7148, lng: 139.7967 },
            type: 'attraction'
        }, auth());
        assert(data.success === true);
        LOCATION_ID = data.data._id;
    });

    await test('GET /locations — list saved locations', async () => {
        const { data } = await axios.get(`${BASE}/locations`, auth());
        assert(data.success === true);
        assert(data.data.length >= 1);
    });

    await test('POST /locations/:id/reviews — add review', async () => {
        const { data } = await axios.post(`${BASE}/locations/${LOCATION_ID}/reviews`, {
            rating: 5, comment: 'Amazing temple, must visit!'
        }, auth());
        assert(data.success === true);
    });

    await test('GET /locations/:id/reviews — get reviews', async () => {
        const { data } = await axios.get(`${BASE}/locations/${LOCATION_ID}/reviews`, auth());
        assert(data.success === true);
        assert(data.data.length >= 1);
        assert(data.data[0].rating === 5);
    });

    // ─── 8. GROUP TRIPS ───
    console.log('\n👥 8. GROUP TRIPS');
    await test('POST /groups — create group', async () => {
        const { data } = await axios.post(`${BASE}/groups`, {
            name: 'Tokyo Squad', description: 'Family trip to Tokyo', tripId: TRIP_ID
        }, auth());
        assert(data.success === true);
        assert(data.data.name === 'Tokyo Squad');
        assert(data.data.inviteCode.length > 0);
        GROUP_ID = data.data._id;
    });

    await test('GET /groups — list my groups', async () => {
        const { data } = await axios.get(`${BASE}/groups`, auth());
        assert(data.success === true);
        assert(data.data.length >= 1);
    });

    await test('GET /groups/:id — get group details', async () => {
        const { data } = await axios.get(`${BASE}/groups/${GROUP_ID}`, auth());
        assert(data.success === true);
        assert(data.data.name === 'Tokyo Squad');
        assert(data.data.members.length >= 1);
    });

    // ─── 9. ADMIN (should fail for non-admin) ───
    console.log('\n🛡️  9. ADMIN ENDPOINTS');
    await test('GET /admin/stats — non-admin rejected (403)', async () => {
        try {
            await axios.get(`${BASE}/admin/stats`, auth());
            throw new Error('Should have failed');
        } catch (e) {
            assert(e.response.status === 403);
        }
    });

    await test('GET /admin/users — non-admin rejected (403)', async () => {
        try {
            await axios.get(`${BASE}/admin/users`, auth());
            throw new Error('Should have failed');
        } catch (e) {
            assert(e.response.status === 403);
        }
    });

    await test('GET /admin/trips — non-admin rejected (403)', async () => {
        try {
            await axios.get(`${BASE}/admin/trips`, auth());
            throw new Error('Should have failed');
        } catch (e) {
            assert(e.response.status === 403);
        }
    });

    await test('GET /admin/stats — no auth rejected (401)', async () => {
        try {
            await axios.get(`${BASE}/admin/stats`);
            throw new Error('Should have failed');
        } catch (e) {
            assert(e.response.status === 401);
        }
    });

    // ─── 10. ERROR HANDLING ───
    console.log('\n⚠️  10. ERROR HANDLING & EDGE CASES');
    await test('GET /api/nonexistent — 404 handler', async () => {
        try {
            await axios.get(`${BASE}/nonexistent`);
            throw new Error('Should have failed');
        } catch (e) {
            assert(e.response.status === 404);
        }
    });

    await test('GET /trips/invalidid — invalid ObjectId', async () => {
        try {
            await axios.get(`${BASE}/trips/invalidid`, auth());
            throw new Error('Should have failed');
        } catch (e) {
            assert(e.response.status >= 400);
        }
    });

    await test('DELETE /trips/:id — delete trip', async () => {
        const { data } = await axios.delete(`${BASE}/trips/${TRIP_ID}`, auth());
        assert(data.success === true);
    });

    await test('GET /trips/:id — deleted trip returns 404', async () => {
        try {
            await axios.get(`${BASE}/trips/${TRIP_ID}`, auth());
            throw new Error('Should have failed');
        } catch (e) {
            assert(e.response.status === 404);
        }
    });

    await test('DELETE /locations/:id — delete location', async () => {
        const { data } = await axios.delete(`${BASE}/locations/${LOCATION_ID}`, auth());
        assert(data.success === true);
    });

    // ─── CLEANUP & SUMMARY ───
    console.log('\n═══════════════════════════════════════');
    console.log(`  RESULTS: ${passed} passed, ${failed} failed (${passed + failed} total)`);
    if (failed === 0) {
        console.log('  🎉 ALL TESTS PASSED!');
    } else {
        console.log(`  ⚠️  ${failed} test(s) failed`);
    }
    console.log('═══════════════════════════════════════\n');
}

run().catch(e => console.error('Fatal error:', e.message));
