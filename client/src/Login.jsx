import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handlesubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:3001/login', { email, password })
      .then(result => {
        if (result.data === "Success") {
          // Saves user to localStorage
          localStorage.setItem("user", JSON.stringify({ email }));

          //  Redirects to Home
          navigate('/home');
        } else {
          setError(result.data); // shows the  error message
        }
      })
      .catch(() => setError("Something went wrong"));
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card p-4 shadow-lg text-center" style={{ width: "400px" }}>
        <h1 className="text-center fw-bold text-success"
      style={{ fontFamily: "'Poppins', sans-serif", marginTop: '50px' }}>LOGIN</h1>
        <form onSubmit={handlesubmit}>
          <label htmlFor='email'>Email:</label><br />
      <input
            onChange={(e) => setEmail(e.target.value)}
            type='email'
            id='email'
            name='email'
            required
      /><br />

       <label htmlFor='password'>Password:</label><br />
    <input
            onChange={(e) => setPassword(e.target.value)}
            type='password'
            id='password'
            name='password'
            required
    /><br /><br />

     <button type='submit' className="btn btn-success">Login</button>
        </form>

        {error && <p className="text-danger mt-2">{error}</p>}
   </div>
    </div>
  );
}

export default Login;
