const express = require("express");
const axios = require("axios");
require("dotenv").config();
const jwtDecode = require('jwt-decode');
const app = express();
const port = 4000;
let access_token =
  "AQUXNq-DsiHdxPuHtnlkdDvXlOLuc0bYt8bLcJCitqAGVXjOeW9YFoWm1uN6IXC1i7-m6sqCdMjTn5lBAa3u2fiIuSoW9eUhGYqV3cr57LWsmssA9DBKHaf9f8fXkL-5Awlllkxcrb4D_ocuGxX-7T6ClOT4wVVLbo1PTNemvq2N-zXh3xPdSc_-sCQwogUCYjWzsiEcCO2n0J_IkdIOoqJMe_KGvYolffyhOZjelh8smZ0nSqEr52qSp6E6o8Q7SFP5UY0i8IAAJE8El7czsZPnvfUd70xWmBW4z1j8rzzmUowcRrvuqtvwTuDbHIuoHSc-ZHAiHUJFYGm8QgvcF3eA4eOHNA";
// LinkedIn OAuth URLs
const LINKEDIN_AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization";
const LINKEDIN_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken";

// Step 1: Redirect to LinkedIn for Authentication
// app.get('/auth/linkedin', (req, res) => {
//   const authUrl = `${LINKEDIN_AUTH_URL}?response_type=code&client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.LINKEDIN_REDIRECT_URI)}&state=fooobar&scope=r_liteprofile%20r_emailaddress%20w_member_social`;
//   res.redirect(authUrl);
// });

// Step 2: Handle LinkedIn callback and exchange authorization code for an access token
// gives the access token for us
app.get("/auth/linkedin/callback", async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).send("Error: Missing authorization code");
  }

  try {
    const response = await axios.post(LINKEDIN_TOKEN_URL, null, {
      params: {
        grant_type: "authorization_code",
        code,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
        redirect_uri: process.env.LINKIDIN_REDIRECT_URI,
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    access_token = response.data.access_token;
    console.log(response.data);
    const idToken=res?.data?.id_token;
    const decodedToken = jwtDecode(idToken);
    const userId = decodedToken.sub;

    console.log("jwt token",decodedToken);
    // call the profile api
    if (!access_token) {
      return res.status(400).send("Error: Access token is required");
    }

    try {
      const response = await axios.get("https://api.linkedin.com/v2/userinfo", {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      console.log(response.data);
      //get the educatinoal details
      axios
        .get(
          `https://api.linkedin.com/v2/educations?q=member&member=${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        )
        .then((response) => {
          // The education details will be returned in response.data
          console.log(response.data);
        })
        .catch((error) => {
          console.error(
            "Error fetching education details:",
            error.response ? error.response.data : error.message
          );
        });
      // Send back the profile data as a response
      res.json(response.data);
    } catch (error) {
      // console.error(error);
      res.status(500).send(error);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching access token");
  }
});

app.get("/", async (req, res) => {
  res.json({ message: "success" }).status(200);
});

app.get("/auth/linkedin/profile", async (req, res) => {
  const decodedToken = jwtDecode("eyJ6aXAiOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImQ5Mjk2NjhhLWJhYjEtNGM2OS05NTk4LTQzNzMxNDk3MjNmZiIsImFsZyI6IlJTMjU2In0.eyJpc3MiOiJodHRwczovL3d3dy5saW5rZWRpbi5jb20vb2F1dGgiLCJhdWQiOiI3OHpyejVrZG1leHB6MSIsImlhdCI6MTczMTkzNjA2MiwiZXhwIjoxNzMxOTM5NjYyLCJzdWIiOiJDcmFjU1k0aGtvIiwibmFtZSI6IkRoYW5lc2ggUG90dGVrdWxhIiwiZ2l2ZW5fbmFtZSI6IkRoYW5lc2giLCJmYW1pbHlfbmFtZSI6IlBvdHRla3VsYSIsInBpY3R1cmUiOiJodHRwczovL21lZGlhLmxpY2RuLmNvbS9kbXMvaW1hZ2UvdjIvRDU2MDNBUUdiWFROUGl3WE54dy9wcm9maWxlLWRpc3BsYXlwaG90by1zaHJpbmtfMTAwXzEwMC9wcm9maWxlLWRpc3BsYXlwaG90by1zaHJpbmtfMTAwXzEwMC8wLzE3MjExNTE2Mjc1MzM_ZT0yMTQ3NDgzNjQ3JnY9YmV0YSZ0PWpod1ljUGpCVmVFY1ZEejdabUNhX2piV0JyblJGc1p3dE1fNTRyR1VyZkkiLCJlbWFpbCI6IkRoYW5lc2hwazM1OUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6InRydWUiLCJsb2NhbGUiOiJlbl9VUyJ9.FG5x57FHQFUcaOo9RyT2fmSrXx42F4IxVuLXk5cKstX8GfIeiGvzeNnyPzoLcNaRElJzQRQ0NaR5tR5fCad7CthxymPKjcDE4afw1agBpmDo2rRNmw0xssIlB1wxZ_5V1yqgG3bMbAYygKyruzY5V7o_xkI--J6VXQe8QnNgylX-QkNwhVegS_sFR1uh5bjrdFp_aq78iZfLAKSdcab5klqUFVAGjJ3Dun2WpuH2tYRPWTNVfrOoRPQIiTfXMxc4T86POjI4iXeJsPvU9Cq7HuwvkzBFaqKqhBvUZd8ZYqsUoQPNkDz2qZB8OqnIwno9Dny4bfULJQaRIM_kj-2zYnOEy_9YGn_fCS992OcZNHSsifrTtslStkzOH44pfpd_AfY2tHQHpDaPeOFpHXZOzB4ZmIVEMS7lxBSvO99gckEazhHmUtfgGvd7GFqdduQ2gQt1ZT2qAFFgCdb1JPZ5Wzfd9OBzU2SK1ugA0MapPvQo1CxqWiAxvrAT-mk3srz5yyhdCMd3oxSo4uhDn61X9oegpXbrwHvWwjyj5ymkjVn2PVSDfm_hmVAr5k7qS5hsvTQ-bEaXSFolfa3wIwY5YiOUmNjj1VbQQBOW_i1bnUZx75EumYSqANJtxPHq5qTxoHMpN-bbBjfgTpN4SIS1VejxKgNtBH4ByrZgCEBU7eU");
    const userId = decodedToken.sub;

    console.log("jwt token",decodedToken);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
