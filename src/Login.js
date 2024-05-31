import React from "react";

function Login() {
  const serverUrl = process.env.REACT_APP_SERVER_URL;

  return (
    <a className="btn-spotify" href={`${serverUrl}/auth/login`}>
      Login with Spotify
    </a>
  );
}

export default Login;
