const API_URL = 'http://localhost:4000';

async function debugLogin(identifier, password, userType) {
  console.log(`\n🔍 Debugging: ${identifier} (${userType})`);
  console.log(`   Password: ${password}`);
  
  // Check if it's considered a phone or username
  const isPhone = /^\d+$/.test(identifier.replace(/\D/g, ""));
  console.log(`   Detected as: ${isPhone ? 'PHONE' : 'USERNAME'}`);
  
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password, userType })
    });
    
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, JSON.stringify(data, null, 2));
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }
}

async function run() {
  await debugLogin('supplier01', 'test1234', 'SUPPLIER');
  await debugLogin('buyer01', 'test1234', 'BUYER');
}

run();
