#!/usr/bin/env node

/**
 * Simple script to test CORS preflight requests
 * Run this to see if your server is logging CORS preflight requests
 */

const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/portfolios',
  method: 'OPTIONS',
  headers: {
    Origin: 'http://localhost:3000',
    'Access-Control-Request-Method': 'GET',
    'Access-Control-Request-Headers': 'Content-Type, Authorization',
  },
};

console.log('🧪 Testing CORS preflight request...');
console.log('Request details:', {
  method: options.method,
  url: `http://${options.hostname}:${options.port}${options.path}`,
  origin: options.headers.Origin,
});

const req = http.request(options, (res) => {
  console.log(`\n📡 Response received:`);
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`Body: ${data || '(empty)'}`);
    console.log(
      '\n✅ Test completed! Check your server logs for CORS preflight messages.',
    );
  });
});

req.on('error', (err) => {
  console.error('❌ Request failed:', err.message);
  console.log('\n💡 Make sure your server is running on port 3000');
});

req.end();
