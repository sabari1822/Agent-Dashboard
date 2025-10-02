import React,{useState} from "react";
import { Link } from "react-router-dom";
import axios from 'axios'
import { useNavigate } from "react-router-dom";





function Signup(){
  const [email,setEmail]=useState() // stores email
  const [password,setPassword]=useState() //stores password
  const navigate= useNavigate() // it is used to navigate to the page we need

  const handlesubmit=(e)=>{
    e.preventDefault()
    axios.post('http://localhost:3001/register',{email,password})
    .then(result=>{console.log(result)
    navigate('/Login')}
  
  )
    .catch(err=> console.log(err))
  }
  return(<>
  <div className="d-flex justify-content-center align-items-center vh-100 bg-light"  >
  <div className="card p-4 shadow-lg  text-center" style={{ width: "400px" }}>
      <div >
        <h1  className="text-center fw-bold text-success"
      style={{ fontFamily: "'Poppins', sans-serif", marginTop: '50px' }}>REGISTER</h1>
    <form onSubmit={handlesubmit}>
      <label for='email'>Email:</label><br></br>
      <input onChange={(e)=>setEmail(e.target.value)} type='email'id='username' name='username' required></input><br></br>

      <label for='password'>Password:</label><br></br>
      <input onChange={(e)=>setPassword(e.target.value)} type='password'id='password' name='password' required></input> <br></br> <br></br>
       <button type= 'submit'className=" btn btn-success">Register</button>
      
    </form><br></br>

    </div>
    <div>
     
      <span>Already Registered?</span><br></br><br></br>
      
         <Link to='/login' className="btn btn-primary">Login</Link> 
     

    
    </div>

  </div>

 

  </div>

   

  </>
    
  )
}

export default Signup;