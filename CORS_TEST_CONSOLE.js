// Copy this into browser console while on http://192.168.1.103:3000
// Then check the Network tab for response headers

fetch('http://localhost/project-advisor-system/backend/debug-cors.php', {
  method: 'GET',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => {
  console.log('=== CORS Debug Response ===');
  console.log('Status:', response.status);
  console.log('Headers:');
  console.log('  Access-Control-Allow-Origin:', response.headers.get('Access-Control-Allow-Origin'));
  console.log('  Access-Control-Allow-Credentials:', response.headers.get('Access-Control-Allow-Credentials'));
  return response.json();
})
.then(data => {
  console.log('Response Data:', data);
})
.catch(error => {
  console.error('CORS Error:', error);
});
