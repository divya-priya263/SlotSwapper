import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { Modal, Button } from "react-bootstrap";

const Marketplace = ({ onSwapSuccess }) => {
  const { user } = useContext(AuthContext);
  const [slots, setSlots] = useState([]);
  const [userSwappableSlots, setUserSwappableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedUserSlot, setSelectedUserSlot] = useState(null);

  useEffect(() => {
    fetchSlots();
    fetchUserSwappableSlots();
  }, []);

  const fetchSlots = async () => {
    const res = await fetch("http://127.0.0.1:8000/api/swappable-slots", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await res.json();
    setSlots(data);
  };

  const fetchUserSwappableSlots = async () => {
    const res = await fetch("http://127.0.0.1:8000/api/my-swappable-slots", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await res.json();
    setUserSwappableSlots(data);
  };

  const handleRequestSwap = (slot) => {
    setSelectedSlot(slot);
    setShowModal(true);
  };

  const confirmSwap = async () => {
    if (!selectedUserSlot) return alert("Select one of your swappable slots!");

    const body = {
      offered_slot_id: selectedUserSlot.id,
      requested_slot_id: selectedSlot.id,
    };

    const res = await fetch("http://127.0.0.1:8000/api/swap-request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      alert("Swap request sent!");
      setShowModal(false);
      if (onSwapSuccess) onSwapSuccess(); // optional callback to refresh dashboard
    } else {
      alert("Swap request failed!");
    }
  };

  return (
    <div className="container mt-5">
      <h2>Marketplace - Available Slots</h2>
      <div className="row g-3 mt-3">
        {slots.map(slot => (
          <div key={slot.id} className="col-md-4">
            <div className="card p-3 shadow">
              <h5>{slot.title}</h5>
              <p>{new Date(slot.date).toLocaleString()}</p>
              <p>Owner: {slot.owner_email}</p>
              <button className="btn btn-primary btn-sm" onClick={() => handleRequestSwap(slot)}>
                Request Swap
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Swap Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Select Your Slot to Offer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {userSwappableSlots.length === 0 ? (
            <p>You have no swappable slots available.</p>
          ) : (
            <ul className="list-group">
              {userSwappableSlots.map(slot => (
                <li
                  key={slot.id}
                  className={`list-group-item ${selectedUserSlot?.id === slot.id ? "active" : ""}`}
                  onClick={() => setSelectedUserSlot(slot)}
                  style={{ cursor: "pointer" }}
                >
                  {slot.title} - {new Date(slot.date).toLocaleString()}
                </li>
              ))}
            </ul>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={confirmSwap}>Confirm Swap</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Marketplace;
