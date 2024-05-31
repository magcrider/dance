import logo from "./logo.svg";
import "./App.css";
import Login from "./Login";
import WebPlayback from "./WebPlayback";
import { useEffect, useState } from "react";

function App() {
  const [token, setToken] = useState(null);
  const urlParams = new URLSearchParams(window.location.search);
  const authorizationCode = urlParams.get("code");

  useEffect(() => {
    async function getToken() {
      const response = await fetch(`/auth/token`);
      const json = await response.json();
      console.log(" *** token:", json.access_token === '');
      if(json.access_token !== '')setToken(json.access_token);
      console.log(" *** tokenstate:", token);
    }
    getToken();
  }, [token]);
  useEffect(() => {
    async function handleAuthCallback() {
      console.log(" *** handleAuthCallback token", token);
      if (!token && authorizationCode) {
        try {
          const response = await fetch(
            `/auth/callback?code=${authorizationCode}`
          );
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
  }, [authorizationCode, token]);

  async function refreshAccessToken() {
    try {
      const response = await fetch("/auth/refresh_token");
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
        <img src={logo} className="App-logo" alt="logo" />
        {!token ? (
          <Login />
        ) : (
          <>
            <button
              name=""
              onClick={() => {
                refreshAccessToken();
              }}
            >
              REFRESH
            </button>
            <WebPlayback token={token} />
          </>
        )}
      </header>
    </div>
  );
}

export default App;
