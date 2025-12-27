// Test the scrap collection API endpoint
const workOrderId = '735b382e-f1e9-451b-b774-f44a083a4fa4';
const apiUrl = 'http://localhost:9645/api/v1/scrap-collections/work-order/' + workOrderId;

console.log('Testing API:', apiUrl);

// Get token from localStorage (you'll need to copy this from your browser)
const token = 'YOUR_TOKEN_HERE'; // Replace with actual token from browser localStorage

fetch(apiUrl, {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
})
    .then(res => {
        console.log('Status:', res.status);
        return res.json();
    })
    .then(data => {
        console.log('Response:', JSON.stringify(data, null, 2));
    })
    .catch(err => {
        console.error('Error:', err);
    });
