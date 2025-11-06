import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

const Notifications = ({ onUpdateDashboard }) => {
  const { user } = useContext(AuthContext);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const res = await fetch("http://127.0.0.1:8000/api/swap-requests", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await res.json();
    setIncoming(data.incoming || []);
    setOutgoing(data.outgoing || []);
  };

  const respondSwap = async (requestId, action) => {
    const res = await fetch("http://127.0.0.1:8000/api/swap-response", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ request_id: requestId, action }),
    });

    if (res.ok) {
      alert(`Swap ${action}ed successfully!`);
      fetchRequests();
      if (onUpdateDashboard) onUpdateDashboard(); // refresh calendar/events
    } else {
      alert("Action failed!");
    }
  };

  return (
    <div className="container mt-5">
      <h2>Notifications</h2>

      <div className="mt-4">
        <h5>Incoming Swap Requests</h5>
        {incoming.length === 0 ? <p>No incoming requests.</p> : (
          <ul className="list-group">
            {incoming.map(req => (
              <li key={req.id} className="list-group-item d-flex justify-content-between align-items-center">
                {req.offered_slot.title} → {req.requested_slot.title} ({new Date(req.requested_slot.date).toLocaleString()})
                <div>
                  <button className="btn btn-success btn-sm me-1" onClick={() => respondSwap(req.id, "accept")}>Accept</button>
                  <button className="btn btn-danger btn-sm" onClick={() => respondSwap(req.id, "reject")}>Reject</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4">
        <h5>Outgoing Swap Requests</h5>
        {outgoing.length === 0 ? <p>No outgoing requests.</p> : (
          <ul className="list-group">
            {outgoing.map(req => (
              <li key={req.id} className="list-group-item">
                {req.offered_slot.title} → {req.requested_slot.title} ({new Date(req.requested_slot.date).toLocaleString()})
                <span className="badge bg-warning ms-2">Pending...</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Notifications;
