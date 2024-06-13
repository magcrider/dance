import logo from "./logo.svg";
import "./App.css";
import Login from "./Login";
import WebPlayback from "./WebPlayback";
import { useEffect, useState } from "react";

function App() {
  const [token, setToken] = useState(null);
  const urlParams = new URLSearchParams(window.location.search);
  const authorizationCode = urlParams.get("code");

  const API_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';

  useEffect(() => {
    async function getToken() {
      try {
        const response = await fetch(`${API_URL}/auth/token`);
        const json = await response.json();
        if (json.access_token !== "") setToken(json.access_token);
      } catch (error) {
        console.error("Error fetching token:", error);
      }
    }
    getToken();
  }, [API_URL, token]);

  useEffect(() => {
    async function handleAuthCallback() {
      if (!token && authorizationCode) {
        try {
          const response = await fetch(`${API_URL}/auth/callback?code=${authorizationCode}`);
          const data = await response.json();
          setToken(data.access_token);
          console.log("Access Token:", data.access_token);

          // Clear the URL query parameters to clean up the URL
          window.history.replaceState({}, document.title, "/");
        } catch (error) {
          console.error("Error fetching token:", error);
        }
      }
    }
    handleAuthCallback();
  }, [API_URL, authorizationCode, token]);

  async function refreshAccessToken() {
    try {
      const response = await fetch(`${API_URL}/auth/refresh_token`);
      const data = await response.json();
      setToken(data.access_token);
      console.log(" *** Refreshed Access Token:", data.access_token);
    } catch (error) {
      console.error("Error refreshing access token:", error);
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <h2
          onClick={() => {
            refreshAccessToken();
          }}
        >
          MAGC Dance player
        </h2>
      </header>
      <div className="main-wrapper">
        {!token ? <Login /> : <WebPlayback token={token} />}
      </div>
    </div>
  );
}

export default App;