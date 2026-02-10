const http = require('http');

const data = JSON.stringify({
  topic: 'Yoga',
  mode: 'GENERAL',
  strategy_mode: 'incubation',
  category: 'Fitness Equipment'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/agent-forum',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Response Body:');
    console.log(responseData);
  });
});

req.on('error', (error) => {
  console.error('Request error:', error.message);
});

req.write(data);
req.end();