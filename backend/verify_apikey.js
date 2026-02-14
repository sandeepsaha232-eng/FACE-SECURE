const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
// You'll need a valid JWT token to run this. 
// This is just a template for manual verification if needed via curl or postman.
/*
curl -X POST http://localhost:5000/api/keys \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Key", "environment": "live"}'
*/

async function testCreateKey(token) {
    try {
        const response = await axios.post(`${BASE_URL}/keys`, {
            name: 'Manual Test Key',
            environment: 'live'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Success:', response.data);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}
