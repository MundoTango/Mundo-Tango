// Quick test script for Agent Rollup API
import http from 'http';

function testEndpoint(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`${method} ${path}`);
        console.log(`Status: ${res.statusCode}`);
        console.log(`${'='.repeat(60)}`);
        
        try {
          const json = JSON.parse(body);
          console.log(JSON.stringify(json, null, 2));
        } catch(e) {
          console.log('Response is not JSON:', body.substring(0, 200));
        }
        
        resolve({ status: res.statusCode, body });
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function runTests() {
  console.log('\n🧪 Testing Agent Rollup System API Endpoints');
  console.log('═'.repeat(60));
  
  try {
    await testEndpoint('/api/agent-rollup/health');
    await testEndpoint('/api/agent-rollup/status');
    await testEndpoint('/api/agent-rollup/stats');
    await testEndpoint('/api/agent-rollup/agents');
    await testEndpoint('/api/agent-rollup/patterns');
    await testEndpoint('/api/agent-rollup/conflicts');
    await testEndpoint('/api/agent-rollup/knowledge?query=test&limit=5');
    
    console.log('\n✅ All tests completed!');
    console.log('═'.repeat(60));
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

runTests();
