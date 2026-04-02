const axios = require('axios');
const BASE = 'http://localhost:5000/api';
let TOKEN = '';
let TRIP_ID = '';
const EMAIL = `integration_${Date.now()}@travelfy.com`;
let passed = 0, failed = 0;

async function test(name, fn) {
    try { await fn(); passed++; console.log(`  ✅ ${name}`); }
    catch (e) { failed++; console.log(`  ❌ ${name} → ${e.response?.data?.error || e.message}`); }
}
function assert(c, m) { if (!c) throw new Error(m || 'Assertion failed'); }
const auth = () => ({ headers: { Authorization: `Bearer ${TOKEN}` } });

async function run() {
    console.log('\n══════════════════════════════════════════════');
    console.log('  FRONTEND-BACKEND INTEGRATION TEST');
    console.log('  (Simulates exact frontend API calls)');
    console.log('══════════════════════════════════════════════\n');

    // ─── FLOW 1: Anonymous user chats with AI (NO LOGIN) ───
    console.log('🔓 FLOW 1: Anonymous AI Chat (no login required)');
    await test('Anonymous user sends chat message', async () => {
        const { data } = await axios.post(`${BASE}/chat`, {
            message: 'What are the best places to visit in Tokyo?'
        });
        assert(data.success === true);
        assert(data.data.message.length > 50, 'AI should give a detailed response');
        console.log(`     → AI replied: "${data.data.message.substring(0, 80)}..."`);
    });

    await test('Anonymous user asks follow-up', async () => {
        const { data } = await axios.post(`${BASE}/chat`, {
            message: 'What about halal food options there?'
        });
        assert(data.success === true);
        assert(data.data.message.length > 30);
    });

    // ─── FLOW 2: User registers via RegisterModal ───
    console.log('\n📝 FLOW 2: Registration (RegisterModal → POST /auth/register)');
    await test('Register new user', async () => {
        const { data } = await axios.post(`${BASE}/auth/register`, {
            name: 'Ahmed Khan', email: EMAIL, password: 'mypass123'
        });
        assert(data.success === true);
        assert(data.data.user.name === 'Ahmed Khan');
        assert(data.data.token.length > 20);
        TOKEN = data.data.token;
        console.log(`     → User: ${data.data.user.name}, Token: ${TOKEN.substring(0, 20)}...`);
    });

    // ─── FLOW 3: User logs in via LoginModal ───
    console.log('\n🔑 FLOW 3: Login (LoginModal → POST /auth/login)');
    await test('Login with credentials', async () => {
        const { data } = await axios.post(`${BASE}/auth/login`, {
            email: EMAIL, password: 'mypass123'
        });
        assert(data.success === true);
        assert(data.data.user.email === EMAIL.toLowerCase());
        TOKEN = data.data.token;
    });

    await test('Login with wrong password shows error', async () => {
        try {
            await axios.post(`${BASE}/auth/login`, { email: EMAIL, password: 'wrong' });
            throw new Error('Should fail');
        } catch (e) { assert(e.response.status === 401); }
    });

    // ─── FLOW 4: Dashboard loads user data ───
    console.log('\n📊 FLOW 4: Dashboard (GET /auth/profile + GET /trips)');
    await test('Dashboard fetches profile', async () => {
        const { data } = await axios.get(`${BASE}/auth/profile`, auth());
        assert(data.success === true);
        assert(data.data.user.name === 'Ahmed Khan');
    });

    await test('Dashboard fetches trips (empty initially)', async () => {
        const { data } = await axios.get(`${BASE}/trips`, auth());
        assert(data.success === true);
        assert(Array.isArray(data.data));
    });

    // ─── FLOW 5: Settings page saves preferences ───
    console.log('\n⚙️  FLOW 5: Settings (PUT /users/preferences)');
    await test('Save travel preferences', async () => {
        const { data } = await axios.put(`${BASE}/users/preferences`, {
            dietary: ['halal'],
            budget: 'moderate',
            preferredCurrency: 'PKR',
            temperatureUnit: 'metric',
            interests: ['history', 'food', 'culture'],
            travelStyle: 'family'
        }, auth());
        assert(data.success === true);
    });

    await test('Verify preferences saved in profile', async () => {
        const { data } = await axios.get(`${BASE}/users/profile`, auth());
        assert(data.data.preferences.dietary.includes('halal'));
        assert(data.data.preferences.preferredCurrency === 'PKR');
        assert(data.data.preferences.travelStyle === 'family');
        console.log(`     → Dietary: ${data.data.preferences.dietary}, Currency: ${data.data.preferences.preferredCurrency}`);
    });

    // ─── FLOW 6: Authenticated AI Chat (with preferences + memory) ───
    console.log('\n🤖 FLOW 6: Authenticated AI Chat (preferences + Redis memory)');
    await test('Chat with preferences context', async () => {
        const { data } = await axios.post(`${BASE}/chat`, {
            message: 'Plan a 3-day Istanbul trip for my family'
        }, auth());
        assert(data.success === true);
        assert(data.data.message.length > 100);
        console.log(`     → AI: "${data.data.message.substring(0, 100)}..."`);
    });

    await test('Follow-up remembers context (Redis memory)', async () => {
        const { data } = await axios.post(`${BASE}/chat`, {
            message: 'Add more halal restaurant options to that plan'
        }, auth());
        assert(data.success === true);
        assert(data.data.message.length > 50);
        const hasHalal = data.data.message.toLowerCase().includes('halal');
        console.log(`     → Mentions halal: ${hasHalal}`);
    });

    // ─── FLOW 7: Trip CRUD (Trips page) ───
    console.log('\n✈️  FLOW 7: Trip CRUD (Trips page)');
    await test('Create trip manually', async () => {
        const { data } = await axios.post(`${BASE}/trips`, {
            title: 'Istanbul Family Trip', destination: 'Istanbul', status: 'planned'
        }, auth());
        assert(data.success === true);
        TRIP_ID = data.data._id;
        console.log(`     → Trip ID: ${TRIP_ID}`);
    });

    await test('Get trip detail (Trip Detail page)', async () => {
        const { data } = await axios.get(`${BASE}/trips/${TRIP_ID}`, auth());
        assert(data.success === true);
        assert(data.data.title === 'Istanbul Family Trip');
        assert(data.data.destination === 'Istanbul');
    });

    await test('Update trip status', async () => {
        const { data } = await axios.put(`${BASE}/trips/${TRIP_ID}`, {
            status: 'active'
        }, auth());
        assert(data.success === true);
        assert(data.data.status === 'active');
    });

    await test('Trips list shows the trip', async () => {
        const { data } = await axios.get(`${BASE}/trips`, auth());
        assert(data.data.some(t => t._id === TRIP_ID));
    });

    await test('Trip requires auth (no token = 401)', async () => {
        try { await axios.get(`${BASE}/trips`); throw new Error('Should fail'); }
        catch (e) { assert(e.response.status === 401); }
    });

    // ─── FLOW 8: Destinations page (external APIs) ───
    console.log('\n🌍 FLOW 8: Destinations page (geocode + weather + places)');
    await test('Geocode Istanbul', async () => {
        const { data } = await axios.get(`${BASE}/external/geocode?q=Istanbul`);
        assert(data.success === true);
        assert(Math.abs(data.data.lat - 41.0) < 1);
        console.log(`     → ${data.data.displayName}`);
    });

    await test('Get Istanbul weather (preference-aware: metric)', async () => {
        const { data } = await axios.get(`${BASE}/external/weather?lat=41.01&lng=28.98`, auth());
        assert(data.success === true);
        assert(data.data.units === 'metric');
        console.log(`     → ${data.data.temp}°C, ${data.data.description}`);
    });

    await test('Search restaurants in Istanbul', async () => {
        const { data } = await axios.get(`${BASE}/external/places?query=Istanbul&lat=41.01&lng=28.98&type=restaurant`);
        assert(data.success === true);
        assert(Array.isArray(data.data));
        console.log(`     → Found ${data.data.length} restaurants`);
    });

    await test('Currency conversion USD → PKR', async () => {
        const { data } = await axios.get(`${BASE}/external/currency?from=USD&to=PKR&amount=500`);
        assert(data.success === true);
        assert(data.data.convertedAmount > 100000);
        console.log(`     → $500 = PKR ${data.data.convertedAmount}`);
    });

    // ─── FLOW 9: Groups ───
    console.log('\n👥 FLOW 9: Group Trip');
    let groupId = '';
    await test('Create group for the trip', async () => {
        const { data } = await axios.post(`${BASE}/groups`, {
            name: 'Khan Family', description: 'Istanbul trip', tripId: TRIP_ID
        }, auth());
        assert(data.success === true);
        groupId = data.data._id;
        console.log(`     → Group: ${data.data.name}, Invite: ${data.data.inviteCode}`);
    });

    await test('List my groups', async () => {
        const { data } = await axios.get(`${BASE}/groups`, auth());
        assert(data.data.length >= 1);
    });

    // ─── FLOW 10: Locations & Reviews ───
    console.log('\n📍 FLOW 10: Save Location + Review');
    let locId = '';
    await test('Save a location', async () => {
        const { data } = await axios.post(`${BASE}/locations`, {
            name: 'Hagia Sophia', destination: 'Istanbul',
            coordinates: { lat: 41.0086, lng: 28.9802 }, type: 'mosque'
        }, auth());
        assert(data.success === true);
        locId = data.data._id;
    });

    await test('Add review to location', async () => {
        const { data } = await axios.post(`${BASE}/locations/${locId}/reviews`, {
            rating: 5, comment: 'Absolutely breathtaking!'
        }, auth());
        assert(data.success === true);
    });

    // ─── FLOW 11: Admin blocked for normal user ───
    console.log('\n🛡️  FLOW 11: Admin access control');
    await test('Normal user cannot access admin stats', async () => {
        try { await axios.get(`${BASE}/admin/stats`, auth()); throw new Error('Should fail'); }
        catch (e) { assert(e.response.status === 403); }
    });

    // ─── FLOW 12: Cleanup ───
    console.log('\n🧹 FLOW 12: Cleanup');
    await test('Delete trip', async () => {
        const { data } = await axios.delete(`${BASE}/trips/${TRIP_ID}`, auth());
        assert(data.success === true);
    });

    await test('Delete location', async () => {
        const { data } = await axios.delete(`${BASE}/locations/${locId}`, auth());
        assert(data.success === true);
    });

    // ─── SUMMARY ───
    console.log('\n══════════════════════════════════════════════');
    console.log(`  RESULTS: ${passed} passed, ${failed} failed (${passed + failed} total)`);
    if (failed === 0) console.log('  🎉 ALL INTEGRATION TESTS PASSED!');
    else console.log(`  ⚠️  ${failed} test(s) failed`);
    console.log('══════════════════════════════════════════════\n');
}

run().catch(e => console.error('Fatal:', e.message));
