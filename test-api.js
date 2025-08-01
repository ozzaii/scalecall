// Test ElevenLabs API
const API_KEY = 'sk_ee2d9e94b385715b65b109851507e58f69a170f3fab84263';

async function testAPI() {
  console.log('Testing ElevenLabs API...\n');
  
  // Test 1: User endpoint
  console.log('1. Testing user endpoint...');
  try {
    const userResponse = await fetch('https://api.elevenlabs.io/v1/user', {
      headers: {
        'xi-api-key': API_KEY,
      },
    });
    
    console.log(`Status: ${userResponse.status}`);
    if (userResponse.ok) {
      const userData = await userResponse.json();
      console.log('User data:', JSON.stringify(userData, null, 2));
    } else {
      const error = await userResponse.text();
      console.error('Error:', error);
    }
  } catch (error) {
    console.error('Failed to fetch user:', error);
  }
  
  console.log('\n2. Testing conversations endpoint...');
  try {
    const convResponse = await fetch('https://api.elevenlabs.io/v1/convai/conversations?page_size=10', {
      headers: {
        'xi-api-key': API_KEY,
      },
    });
    
    console.log(`Status: ${convResponse.status}`);
    if (convResponse.ok) {
      const convData = await convResponse.json();
      console.log('Conversations:', JSON.stringify(convData, null, 2));
    } else {
      const error = await convResponse.text();
      console.error('Error:', error);
    }
  } catch (error) {
    console.error('Failed to fetch conversations:', error);
  }
  
  console.log('\n3. Testing alternative conversations endpoint...');
  try {
    const altResponse = await fetch('https://api.elevenlabs.io/v1/history', {
      headers: {
        'xi-api-key': API_KEY,
      },
    });
    
    console.log(`Status: ${altResponse.status}`);
    if (altResponse.ok) {
      const altData = await altResponse.json();
      console.log('History:', JSON.stringify(altData, null, 2));
    } else {
      const error = await altResponse.text();
      console.error('Error:', error);
    }
  } catch (error) {
    console.error('Failed to fetch history:', error);
  }
}

testAPI();