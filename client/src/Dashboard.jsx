import React from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  function Handle() {  //
    navigate("/Login");
  }

  function HandleRegister() {
    navigate("/register");
  }

  return (
    <>
      
   <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm sticky-top px-3">
   <div className="container-fluid">
          
  <a className="navbar-brand fw-bold text-warning" href="#">
            Trial Website
       </a>

          
    <div className="collapse navbar-collapse" id="navbarNav">
      <ul className="navbar-nav me-auto mb-2 mb-lg-0"></ul>

            
         <div className="d-flex align-items-center gap-3">
           <button
            onClick={Handle}
            className="btn btn-warning text-dark fw-semibold px-3 py-1"
              >
             Login
      </button>
          <button
                onClick={HandleRegister}
                className="btn btn-warning text-dark fw-semibold px-3 py-1"
              >
                Register
           </button>
         </div>
      </div>
          </div>
      </nav>

      
      <div className="container my-5">
        <h1 className="fw-bold text-center mb-4">Welcome to Trial Website 🚀</h1>
        <p className="text-muted text-center">
          This website was made for CSTech Infosolutions Private Limited
        </p>
      </div>
    </>
  );
}
