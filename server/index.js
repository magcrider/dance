const express = require('express');
const request = require('request');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

const port = process.env.PORT || 5000;

dotenv.config();

let access_token = '';
let refresh_token = '';

const spotify_client_id = process.env.SPOTIFY_CLIENT_ID;
const spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const spotify_redirect_uri = process.env.SPOTIFY_REDIRECT_URI;

const generateRandomString = function (length) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

const app = express();

// Use the cors middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.PRODUCTION_URL : 'http://localhost:3000'
}));

app.use(bodyParser.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '..', 'build')));

app.get('/auth/login', (req, res) => {
  const scope = "streaming user-read-email user-read-private";
  const state = generateRandomString(16);

  const auth_query_parameters = new URLSearchParams({
    response_type: "code",
    client_id: spotify_client_id,
    scope: scope,
    redirect_uri: spotify_redirect_uri,
    state: state
  });

  res.redirect('https://accounts.spotify.com/authorize/?' + auth_query_parameters.toString());
});

// Handle the GET request from the React app to exchange the code for an access token
app.get('/auth/callback', (req, res) => {
  const code = req.query.code;

  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: spotify_redirect_uri,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + Buffer.from(spotify_client_id + ':' + spotify_client_secret).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    json: true
  };

  request.post(authOptions, function (error, response, body) {
    if (error) {
      console.error('Request Error:', error);
      res.status(500).send('Internal Server Error');
      return;
    }
    if (response.statusCode === 200) {
      access_token = body.access_token;
      refresh_token = body.refresh_token;
      res.redirect('/'); // Redirect to the root of your app
    } else {
      console.error('Error fetching access token:', body);
      res.status(response.statusCode).send('Error fetching access token');
    }
  });
});

app.get('/auth/token', (req, res) => {
  res.json({ access_token: access_token });
});

app.get('/auth/refresh_token', (req, res) => {
  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    headers: {
      'Authorization': 'Basic ' + Buffer.from(spotify_client_id + ':' + spotify_client_secret).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    json: true
  };

  request.post(authOptions, function (error, response, body) {
    if (error) {
      console.error('Request Error:', error);
      res.status(500).send('Internal Server Error');
      return;
    }

    console.log('Response Status Code:', response.statusCode);
    console.log('Response Body:', body);

    if (response.statusCode === 200) {
      access_token = body.access_token;
      console.log('New Access Token:', access_token);
      res.json({ access_token: access_token });
    } else {
      console.error('Error refreshing access token:', body);
      res.status(response.statusCode).send('Error refreshing access token');
    }
  });
});

// Catch-all handler to serve the React app's index.html for any other request
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});