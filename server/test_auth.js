async function testSignup() {
  try {
    const response = await fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test_final_' + Date.now() + '@example.com',
        password: 'password123'
      })
    });
    
    const data = await response.json();
    if (response.ok) {
      console.log('Signup Success:', data);
    } else {
      console.error('Signup Failed:', data);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testSignup();
