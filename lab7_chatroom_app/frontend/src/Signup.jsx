export default function Signup() {
  async function signup(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    await fetch(
      'http://localhost:8080/signup',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          username: username,
          password: password
        })
      }
    );

    window.location.href = '/';

  }

  return (
    <div>
      <h1>Signup</h1>
      <form onSubmit={signup}>
        <input id="username"   placeholder="Username"/>
        <input  id="password"  type="password"   placeholder="Passwordd" />
        <button>  Signup  </button>
      </form>
    </div>
  );
}
