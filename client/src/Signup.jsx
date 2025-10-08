import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';

function Signup() {
    // 1. Add state for name and initialize all with empty strings
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // 2. Add state for loading and error feedback
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const navigate = useNavigate();

    const handlesubmit = (e) => {
        e.preventDefault();
        setError(''); // Reset error message on new submission
        setLoading(true); // Disable button

        // 3. Send all three fields to the backend
        axios.post('http://localhost:3001/register', { name, email, password })
            .then(result => {
                console.log(result);
                // On success, navigate to the Login page
                navigate('/Login');
            })
            .catch(err => {
                console.log(err);
                // 4. Set an error message to display to the user
                if (err.response && err.response.data) {
                    // Use a more specific error from backend if available
                    setError(err.response.data.message || "Registration failed. Please try again.");
                } else {
                    setError("An unknown error occurred.");
                }
            })
            .finally(() => {
                setLoading(false); // Re-enable button
            });
    }

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="card p-4 shadow-lg text-center" style={{ width: "400px" }}>
                <div>
                    <h1 className="text-center fw-bold text-success" style={{ fontFamily: "'Poppins', sans-serif", marginTop: '50px' }}>REGISTER</h1>
                    <form onSubmit={handlesubmit}>
                        {/* Name Input */}
                        <label htmlFor='name'>Name:</label><br />
                        <input
                            id='name'
                            name='name'
                            type='text'
                            value={name} // Make it a controlled component
                            onChange={(e) => setName(e.target.value)}
                            required
                        /><br />

                        {/* Email Input (fixed label 'for' and input 'id') */}
                        <label htmlFor='email'>Email:</label><br />
                        <input
                            id='email'
                            name='email'
                            type='email'
                            value={email} // Make it a controlled component
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        /><br />

                        {/* Password Input */}
                        <label htmlFor='password'>Password:</label><br />
                        <input
                            id='password'
                            name='password'
                            type='password'
                            value={password} // Make it a controlled component
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        /><br /><br />

                        {/* Disable button when loading */}
                        <button type='submit' className="btn btn-success" disabled={loading}>
                            {loading ? 'Registering...' : 'Register'}
                        </button>
                    </form><br />

                    {/* Display error message if it exists */}
                    {error && <p className="text-danger mt-2">{error}</p>}

                </div>
                <div>
                    <span>Already Registered?</span><br /><br />
                    <Link to='/login' className="btn btn-primary">Login</Link>
                </div>
            </div>
        </div>
    );
}

export default Signup;