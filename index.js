const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = 4000;
let access_token;
// LinkedIn OAuth URLs
const LINKEDIN_AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization';
const LINKEDIN_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';

// Step 1: Redirect to LinkedIn for Authentication
// app.get('/auth/linkedin', (req, res) => {
//   const authUrl = `${LINKEDIN_AUTH_URL}?response_type=code&client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.LINKEDIN_REDIRECT_URI)}&state=fooobar&scope=r_liteprofile%20r_emailaddress%20w_member_social`;
//   res.redirect(authUrl);
// });

// Step 2: Handle LinkedIn callback and exchange authorization code for an access token
// gives the access token for us 
app.get('/auth/linkedin/callback', async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).send('Error: Missing authorization code');
  }

  try {
    const response = await axios.post(LINKEDIN_TOKEN_URL, null, {
      params: {
        grant_type: 'authorization_code',
        code,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

     access_token  = response.data.access_token;
     console.log(access_token);
    res.json({ access_token });

  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching access token');
  }
});


app.get('/auth/linkedin/profile', async (req, res) => {
    
    if (!access_token) {
      return res.status(400).send('Error: Access token is required');
    }
  
    try {
      const response = await axios.get('https://api.linkedin.com/v2/me', {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      });
  
      // Send back the profile data as a response
      res.json(response.data);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching LinkedIn profile');
    }
  });
  
// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
