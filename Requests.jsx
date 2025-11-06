import React, { useEffect, useState } from "react";
import { fetchIncomingRequests, fetchOutgoingRequests, respondSwap } from "../api";

export default function Requests() {
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);

  async function load() {
    setIncoming(await fetchIncomingRequests());
    setOutgoing(await fetchOutgoingRequests());
  }

  useEffect(() => { load(); }, []);

  async function onRespond(id, accept) {
    await respondSwap(id, accept);
    await load();
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Incoming Requests</h2>
      <ul>
        {incoming.map(r => (
          <li key={r.id}>
            Request #{r.id} — my_event: {r.my_event_id} — their_event: {r.their_event_id} — status: {r.status}
            <button onClick={() => onRespond(r.id, true)} style={{ marginLeft: 10 }}>Accept</button>
            <button onClick={() => onRespond(r.id, false)} style={{ marginLeft: 10 }}>Reject</button>
          </li>
        ))}
      </ul>

      <h2>Outgoing Requests</h2>
      <ul>
        {outgoing.map(r => (
          <li key={r.id}>Request #{r.id} — my_event: {r.my_event_id} — their_event: {r.their_event_id} — status: {r.status}</li>
        ))}
      </ul>
    </div>
  );
}
