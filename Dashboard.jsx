import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "bootstrap/dist/css/bootstrap.min.css";
import DataTable from "react-data-table-component";
import "./Dashboard.css";

const Dashboard = () => {
  const [events, setEvents] = useState([
    { id: 1, title: "Meeting with Team", date: "2025-11-06", color: "#0d6efd", status: "Busy" },
    { id: 2, title: "Project Review", date: "2025-11-08", color: "#198754", status: "Busy" },
    { id: 3, title: "Call with Client", date: "2025-11-10", color: "#fd7e14", status: "Busy" },
  ]);

  const [newEvent, setNewEvent] = useState({ title: "", date: "", time: "" });

  // Drag & drop
  const handleEventDrop = (info) => {
    const updatedEvents = events.map(evt =>
      evt.id.toString() === info.event.id
        ? { ...evt, date: info.event.startStr, color: "#dc3545", status: "Swapped" }
        : evt
    );
    setEvents(updatedEvents);
  };

  // Add Event
  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date || !newEvent.time) return;
    const id = Date.now();
    const dateTime = new Date(`${newEvent.date}T${newEvent.time}`);
    setEvents([...events, { id, title: newEvent.title, date: dateTime.toISOString(), color: "#6610f2", status: "Busy" }]);
    setNewEvent({ title: "", date: "", time: "" });
  };

  // Delete Event
  const handleDeleteEvent = (id) => setEvents(events.filter(evt => evt.id !== id));

  // Make Swappable
  const makeSwappable = (id) => {
    setEvents(events.map(evt => evt.id === id ? { ...evt, status: "Swappable", color: "#ffc107" } : evt));
  };

  // DataTable columns
  const columns = [
    { name: "Title", selector: row => row.title, sortable: true },
    { name: "Date", selector: row => new Date(row.date).toLocaleString(), sortable: true },
    { name: "Status", selector: row => row.status, sortable: true },
    {
      name: "Actions",
      cell: row => (
        <div className="d-flex gap-1">
          <button className="btn btn-warning btn-sm" onClick={() => makeSwappable(row.id)}>Make Swappable</button>
          <button className="btn btn-danger btn-sm" onClick={() => handleDeleteEvent(row.id)}>Delete</button>
        </div>
      )
    }
  ];

  return (
    <div className="dashboard-container">
      <div className="welcome-section text-center py-4">
        <h1 className="text-white">Welcome to My Event Dashboard</h1>
        <p className="text-white">Track your events, swap slots, and stay organized!</p>
      </div>

      {/* Add Event Form */}
      <div className="container mb-4">
        <div className="card p-3 shadow">
          <h5>Add New Event</h5>
          <form className="row g-3" onSubmit={handleAddEvent}>
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Event Title"
                value={newEvent.title}
                onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
              />
            </div>
            <div className="col-md-3">
              <input
                type="date"
                className="form-control"
                value={newEvent.date}
                onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
              />
            </div>
            <div className="col-md-3">
              <input
                type="time"
                className="form-control"
                value={newEvent.time}
                onChange={e => setNewEvent({ ...newEvent, time: e.target.value })}
              />
            </div>
            <div className="col-md-2 d-flex gap-2">
              <button type="submit" className="btn btn-primary w-100">Add</button>
            </div>
          </form>
        </div>
      </div>

      {/* Event DataTable */}
      <div className="container mb-4">
        <h5>All Events</h5>
        <DataTable
          columns={columns}
          data={events}
          pagination
          highlightOnHover
          striped
        />
      </div>

      {/* Calendar */}
      <div className="container mb-5">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          editable={true}
          selectable={true}
          events={events}
          eventDrop={handleEventDrop}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          height="auto"
        />
      </div>
    </div>
  );
};

export default Dashboard;
