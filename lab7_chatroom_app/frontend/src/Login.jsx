export default function Login() {

  async function login(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch( 'http://localhost:8080/login',
      {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            username: username,
            password: password
        })
      }
    );

    const data = await response.json();

    if (data.success) {
      window.location.href = '/home';
    } else {
      alert('Login Failed');
    }
  }

  return (
    <div>
        <h1>Login</h1>
        <form onSubmit={login}>
            <input id="username" placeholder="Username" />
            <input id="password" type="password" placeholder="Password"/>
            <button> Login </button>
      </form>
      <br />

      <a href="/signup">   Signup </a>
    </div>
  );
}
