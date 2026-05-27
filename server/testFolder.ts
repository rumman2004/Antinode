import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config({ override: true });

async function testFolderCreation() {
  try {
    // 1. We need a token. Let's just bypass auth for a moment by reading a mock token if possible.
    // Or we can just use the auth API to login/register to get a token!
    const registerRes = await axios.post('http://localhost:5000/api/auth/register', {
      firstName: 'Test',
      lastName: 'User',
      email: 'testfolder@example.com',
      password: 'password123'
    }).catch(e => e.response);

    let token = registerRes.data?.data?.token;

    if (!token) {
      const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'testfolder@example.com',
        password: 'password123'
      });
      token = loginRes.data.data.token;
    }

    const folderRes = await axios.post('http://localhost:5000/api/folders', {
      name: 'Test Folder ' + Date.now()
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Success:', folderRes.data);
  } catch (e: any) {
    console.error('Error:', e.response?.data || e.message);
  }
}

testFolderCreation();
