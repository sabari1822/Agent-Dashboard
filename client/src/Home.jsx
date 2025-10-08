import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Axios instance with token interceptor
const api = axios.create({
    baseURL: "http://localhost:3001",
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default function Home() {
    const navigate = useNavigate();
    const [agents, setAgents] = useState([]);
    const [items, setItems] = useState([]);
    const [agentForm, setAgentForm] = useState({ name: "", email: "", mobile: "", password: "" });
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Redirect if no token
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login", { replace: true });
        } else {
            fetchData();
        }
    }, [navigate]);

    // Fetch agents and items
    const fetchData = async () => {
        try {
            const [agentsRes, itemsRes] = await Promise.all([
                api.get("/agents"),
                api.get("/items")
            ]);
            setAgents(agentsRes.data);
            setItems(itemsRes.data);
        } catch (err) {
            console.error("Failed to fetch data:", err);
            if (err.response && err.response.status === 401) {
                handleLogout();
            } else {
                setError("Failed to load data.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const addAgent = async (e) => {
        e.preventDefault();
        try {
            await api.post("/agents", agentForm);
            setAgentForm({ name: "", email: "", mobile: "", password: "" });
            fetchData();
        } catch (err) {
            console.error(err);
            setError("Failed to add agent.");
        }
    };

    const deleteAgent = async (id) => {
        try {
            await api.delete(`/agents/${id}`);
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
            await api.post("/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setFile(null);
            e.target.reset();
            fetchData();
        } catch (err) {
            console.error(err);
            setError("File upload failed.");
        }
    };

    // Null-safe getTasksForAgent
    const getTasksForAgent = (agentId) => {
        return items.filter((item) => {
            if (!item.assignedTo) return false; // skip null
            return typeof item.assignedTo === "object"
                ? item.assignedTo._id === agentId
                : item.assignedTo === agentId;
        });
    };

    if (loading) {
        return (
            <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
                <div className="h4 text-muted">Loading Dashboard...</div>
            </div>
        );
    }

    return (
        <div className="container py-4 bg-light min-vh-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-success">Dashboard</h2>
                <button onClick={handleLogout} className="btn btn-danger btn-sm">
                    Logout
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {/* Add Agent Form */}
            <div className="card p-3 mb-4 shadow-sm">
                <h5 className="mb-3 text-success fw-semibold">Add Agent</h5>
                <form className="row g-2" onSubmit={addAgent}>
                    <div className="col-md-3">
                        <input
                            type="text"
                            placeholder="Name"
                            className="form-control"
                            value={agentForm.name}
                            onChange={(e) => setAgentForm({ ...agentForm, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="col-md-3">
                        <input
                            type="email"
                            placeholder="Email"
                            className="form-control"
                            value={agentForm.email}
                            onChange={(e) => setAgentForm({ ...agentForm, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="col-md-3">
                        <input
                            type="text"
                            placeholder="Mobile"
                            className="form-control"
                            value={agentForm.mobile}
                            onChange={(e) => setAgentForm({ ...agentForm, mobile: e.target.value })}
                            required
                        />
                    </div>
                    <div className="col-md-3">
                        <input
                            type="password"
                            placeholder="Password"
                            className="form-control"
                            value={agentForm.password}
                            onChange={(e) => setAgentForm({ ...agentForm, password: e.target.value })}
                            required
                        />
                    </div>
                    <div className="col-12 text-end">
                        <button type="submit" className="btn btn-success mt-2">Add Agent</button>
                    </div>
                </form>
            </div>

            {/* Upload CSV */}
            <div className="card p-3 mb-4 shadow-sm">
                <h5 className="mb-3 text-success fw-semibold">Upload CSV File</h5>
                <form onSubmit={uploadFile}>
                    <div className="d-flex gap-2">
                        <input
                            type="file"
                            className="form-control"
                            accept=".csv"
                            onChange={(e) => setFile(e.target.files[0])}
                        />
                        <button type="submit" className="btn btn-primary">Upload</button>
                    </div>
                </form>
            </div>

            {/* Agents & Assigned Items */}
            <div className="row g-3">
                {agents.map((agent) => {
                    const tasks = getTasksForAgent(agent._id);
                    return (
                        <div key={agent._id} className="col-md-4">
                            <div className="card h-100 shadow-sm">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <h5 className="card-title text-success fw-bold">{agent.name}</h5>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => deleteAgent(agent._id)}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    <p className="text-muted mb-3">{agent.email}</p>
                                    <h6 className="fw-semibold mb-2">Assigned Items:</h6>
                                    {tasks.length > 0 ? (
                                        <ul className="list-group list-group-flush small">
                                            {tasks.map((task) => (
                                                <li key={task._id} className="list-group-item px-0">
                                                    <strong>Name:</strong> {task.firstName || "N/A"} <br />
                                                    <strong>Phone:</strong> {task.phone || "N/A"} <br />
                                                    <strong>Notes:</strong> {task.notes || "No notes"}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-muted small">No items assigned</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
