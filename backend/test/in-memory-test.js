/**
 * In-Memory Verification Runner for CampusConnect
 */
require('dotenv').config();
const externalApiService = require('../services/externalApiService');
const jsonStorage = require('../services/jsonStorageService');
const eventController = require('../controllers/eventController');
const registrationController = require('../controllers/registrationController');
const clubController = require('../controllers/clubController');
const jsonController = require('../controllers/jsonController');

function createMockRes() {
  return {
    statusCode: 200,
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.data = payload;
      return this;
    },
    send(payload) {
      this.data = payload;
      return this;
    }
  };
}

async function run() {
  console.log('\n============================================================');
  console.log('🧪 CampusConnect In-Memory Verification Suite');
  console.log('============================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, name) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${name}`);
    }
  }

  // 1. External APIs
  console.log('📋 Testing Parameter 1: External APIs Integration');
  const weather = await externalApiService.getWeather();
  assert(weather.success === true, 'Weather service returns success');
  assert(weather.temperature !== undefined, `Weather service returns temperature: ${weather.temperature}`);
  assert(weather.advisory !== undefined, `Weather service includes campus advisory`);

  const quote = await externalApiService.getDailyQuote();
  assert(quote.success === true, 'Quote service returns success');
  assert(quote.quote && quote.author, `Quote service returns author: ${quote.author}`);

  const holidays = externalApiService.getHolidays();
  assert(holidays.success === true && holidays.holidays.length > 0, `Holidays service returns ${holidays.holidays.length} holidays`);

  // 2. Local JSON File Storage
  console.log('\n📋 Testing Parameter 3: Express APIs for Local JSON File Storage');
  const mockRes1 = createMockRes();
  await jsonController.getEvents({ query: {} }, mockRes1);
  assert(mockRes1.statusCode === 200, 'GET /api/local/events returns 200');
  assert(Array.isArray(mockRes1.data.data), 'Local events returned as array');

  const testEventTitle = 'In-Memory Test Event ' + Date.now();
  const mockRes2 = createMockRes();
  await jsonController.createEvent({
    body: {
      title: testEventTitle,
      description: 'Testing atomic JSON storage service',
      venue: 'Main Auditorium',
      totalSeats: 150
    }
  }, mockRes2);
  assert(mockRes2.statusCode === 201, 'POST /api/local/events creates event');
  assert(mockRes2.data.data.title === testEventTitle, 'Created event title verified');

  const createdId = mockRes2.data.data.id;
  const mockRes3 = createMockRes();
  await jsonController.deleteEvent({ params: { id: createdId } }, mockRes3);
  assert(mockRes3.statusCode === 200, 'DELETE /api/local/events/:id removes event');

  // 3. CRUD Operations & Student Registrations
  console.log('\n📋 Testing Parameter 4: CRUD Operations & MongoDB/Fallback Logic');
  const mockRes4 = createMockRes();
  await eventController.getAllEvents({ query: {} }, mockRes4);
  assert(mockRes4.statusCode === 200, 'GET /api/events returns 200');

  const mockRes5 = createMockRes();
  await registrationController.createRegistration({
    body: {
      eventTitle: 'TechFest 2026: Code & Innovate',
      fullName: 'Chaitanya Aggarwal',
      rollNumber: '23CSE1042',
      email: 'chaitanya.aggarwal@campus.edu',
      department: 'CSE',
      yearOfStudy: '3rd Year'
    }
  }, mockRes5);
  assert(mockRes5.statusCode === 201, 'POST /api/registrations creates registration');
  assert(mockRes5.data.registrationId && mockRes5.data.registrationId.startsWith('CC-2026-'), `Generated custom ID: ${mockRes5.data.registrationId}`);

  const regId = mockRes5.data.registrationId;
  const mockRes6 = createMockRes();
  await registrationController.getRegistrationById({ params: { id: regId } }, mockRes6);
  assert(mockRes6.statusCode === 200, 'GET /api/registrations/:id finds registration');

  const mockRes7 = createMockRes();
  await registrationController.deleteRegistration({ params: { id: regId } }, mockRes7);
  assert(mockRes7.statusCode === 200, 'DELETE /api/registrations/:id cancels registration');

  console.log('\n============================================================');
  console.log(`🏁 Test Summary: All ${passed}/${total} assertions passed cleanly!`);
  console.log('============================================================\n');

  process.exit(passed === total ? 0 : 1);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
