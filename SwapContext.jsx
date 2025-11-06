// src/contexts/SwapContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";
import { slots } from "../api";
import { AuthContext } from "./AuthContext";

export const SwapContext = createContext();

export function SwapProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [myEvents, setMyEvents] = useState([]);
  const [marketSlots, setMarketSlots] = useState([]);
  const [requests, setRequests] = useState({ incoming: [], outgoing: [] });
  const [loading, setLoading] = useState(false);

  async function loadMyEvents() {
    try {
      const data = await slots.getMyEvents();
      setMyEvents(data || []);
    } catch (e) {
      console.error("loadMyEvents", e);
      setMyEvents([]);
    }
  }

  async function loadMarket() {
    try {
      const data = await slots.getSwappableSlots();
      setMarketSlots(data || []);
    } catch (e) {
      console.error("loadMarket", e);
      setMarketSlots([]);
    }
  }

  async function loadRequests() {
    try {
      const data = await slots.getRequests();
      // expect { incoming: [], outgoing: [] } or some structure
      if (data && data.incoming && data.outgoing) setRequests(data);
      else setRequests({ incoming: data?.incoming || [], outgoing: data?.outgoing || [] });
    } catch (e) {
      console.error("loadRequests", e);
      setRequests({ incoming: [], outgoing: [] });
    }
  }

  useEffect(() => {
    if (user) {
      loadMyEvents();
      loadMarket();
      loadRequests();
    } else {
      setMyEvents([]);
      setMarketSlots([]);
      setRequests({ incoming: [], outgoing: [] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <SwapContext.Provider value={{
      myEvents, marketSlots, requests,
      loadMyEvents, loadMarket, loadRequests,
      setMyEvents, setMarketSlots, setRequests, loading
    }}>
      {children}
    </SwapContext.Provider>
  );
}
