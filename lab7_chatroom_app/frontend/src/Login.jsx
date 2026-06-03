import { useState } from "react";

export default function Login() {
  const [error, setError] = useState(""); // NEW: track error message

  async function login(event) {
    event.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const response = await fetch("http://localhost:8080/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    // If status is not 200, login failed — don't try to parse JSON
    if (!response.ok) {
      setError("Invalid username or password.");
      return;
    }

    const data = await response.json();

    if (data.success) {
      window.location.href = "/home";
    } else {
      setError("Invalid username or password.");
    }
  }

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={login}>
        <input id="username" placeholder="Username" />
        <input id="password" type="password" placeholder="Password" />
        <button>Login</button>
      </form>
      {/* NEW: show error message below the form if login failed */}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <br />
      <a href="/signup">Signup</a>
    </div>
  );
}
