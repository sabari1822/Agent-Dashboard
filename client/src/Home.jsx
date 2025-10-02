import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";


export default function Home() {
    const navigate = useNavigate();
    const [agents, setAgents] = useState([]);
    const [items, setItems] = useState([]);
    const [agentForm, setAgentForm] = useState({ name: "", email: "", mobile: "", password: "" });
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = localStorage.getItem("user");
        if (!user) {
            navigate("/login", { replace: true });
        } else {
            fetchData();
        }
    }, [navigate]);

    const fetchData = async () => {
        try {
            const [agentsRes, itemsRes] = await Promise.all([
                axios.get("http://localhost:3001/agents"),
                axios.get("http://localhost:3001/items")
            ]);
            setAgents(agentsRes.data);
            setItems(itemsRes.data);
        } catch (err) {
            console.error("Failed to fetch data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/login");
    };

    const addAgent = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:3001/agents", agentForm);
            setAgentForm({ name: "", email: "", mobile: "", password: "" });
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const deleteAgent = async (id) => {
        try {
            await axios.delete(`http://localhost:3001/agents/${id}`);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const uploadFile = async (e) => {
        e.preventDefault();
        if (!file) return;
        const formData = new FormData();
        formData.append("file", file);
        try {
            await axios.post("http://localhost:3001/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setFile(null);
            e.target.reset();
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    // helper function to get the correct agent ID from an item
    const getAssignedToId = (item) => {
        if (!item.assignedTo) return null;
        // Check if assignedTo is a populated object or just an ID string
        return typeof item.assignedTo === 'object' ? item.assignedTo._id : item.assignedTo;
    };

    if (loading) {
        return (
            <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
                <div className="h4 text-muted">Loading Dashboard...</div>
            </div>
        );
    }

    return (
        <div className="bg-light min-vh-100">
            <div className="container-fluid p-4 p-md-5">
                <header className="d-flex justify-content-between align-items-center pb-3 mb-4 border-bottom">
                    <h1 className="h2 fw-bold text-dark">Admin Dashboard</h1>
             <button onClick={handleLogout} className="btn btn-outline-danger btn-sm d-flex align-items-center gap-2">
            <i className="bi bi-box-arrow-right"></i>
              <span>Logout</span>
            </button>
                </header>

    <main className="d-grid gap-4">
                    
         <section className="card shadow-sm">
             <div className="card-body p-4">
                 <h2 className="h4 card-title mb-4 d-flex align-items-center gap-3">
                <i className="bi bi-person-plus-fill text-primary fs-4"></i> Agent Management
            </h2>
                            <form onSubmit={addAgent} className="row g-3 align-items-end mb-4">
                                <div className="col-md">
                                    <input placeholder="Name" value={agentForm.name} onChange={(e) => setAgentForm({ ...agentForm, name: e.target.value })} className="form-control" required />
                                </div>
                                <div className="col-md">
                                    <input placeholder="Email" type="email" value={agentForm.email} onChange={(e) => setAgentForm({ ...agentForm, email: e.target.value })} className="form-control" required />
                                </div>
                                <div className="col-md">
                                    <input placeholder="Mobile" value={agentForm.mobile} onChange={(e) => setAgentForm({ ...agentForm, mobile: e.target.value })} className="form-control" required />
                                </div>
                                <div className="col-md">
                                    <input type="password" placeholder="Password" value={agentForm.password} onChange={(e) => setAgentForm({ ...agentForm, password: e.target.value })} className="form-control" required />
                                </div>
                                <div className="col-md-auto">
                                    <button className="btn btn-primary w-100">Add Agent</button>
                                </div>
                            </form>
                            <div className="list-group" style={{maxHeight: '250px', overflowY: 'auto'}}>
                                {agents.map((a) => (
                                    <div key={a._id} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                              <div>
                                 <div className="fw-semibold">{a.name}</div>
                                    <div className="small text-muted">{a.email} – {a.mobile}</div>
                             </div>
                             <button onClick={() => deleteAgent(a._id)} className="btn btn-outline-danger btn-sm border-0"><i className="bi bi-trash3"></i></button>
                       </div>
                                ))}
                      </div>
                        </div>
                    </section>

                    {/* This is the section for uploading the file */}
            <section className="card shadow-sm">
               <div className="card-body p-4">
                   <h2 className="h4 card-title mb-4 d-flex align-items-center gap-3">
                                <i className="bi bi-cloud-upload-fill text-success fs-4"></i> Upload & Distribute
                     </h2>
                            <form onSubmit={uploadFile} className="d-flex gap-3">
                                <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} className="form-control" />
                        <button className="btn btn-success">Upload</button>
                            </form>
                        </div>
                    </section>

                    {/* Here you can see the distibuted tasks */}
                    <section className="card shadow-sm">
                        <div className="card-body p-4">
                             <h2 className="h4 card-title mb-4 d-flex align-items-center gap-3">
                                <i className="bi bi-people-fill text-info fs-4"></i> Task Distribution
                            </h2>
                            <div className="row g-4">
                                {agents.map((agent) => (  // it takes all the necessary name etc and distributes
                                    <div key={agent._id} className="col-md-6 col-lg-4">
                                        <div className="card h-100">
                          <div className="card-header fw-bold">{agent.name}</div>
                              <ul className="list-group list-group-flush" style={{maxHeight: '300px', overflowY: 'auto'}}>
                                                {items.filter((i) => getAssignedToId(i) === agent._id).map((task, idx) => (
                                       <li key={idx} className="list-group-item small">
                                                        <div className="fw-semibold">{task.firstName}</div>
                                                        <div className="text-muted"><i className="bi bi-telephone me-1"></i>{task.phone}</div>
                                                        {task.notes && <div className="text-muted fst-italic mt-1"><i className="bi bi-card-text me-1"></i>{task.notes}</div>}
                                     </li>
                                                ))}
                                                {items.filter((i) => getAssignedToId(i) === agent._id).length === <strong>0</strong> && (
                                                    <li className="list-group-item text-center text-muted small p-4">No tasks assigned.</li>
                                                )}
                            </ul>
                                       </div>
                                    </div>
                                ))}
                     </div>
                        </div>
                        </section>
                       </main>
                  </div>
                 </div>
    );
}

