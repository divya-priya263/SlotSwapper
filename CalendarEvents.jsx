// Import FullCalendar React component
import FullCalendar from "@fullcalendar/react";

// Import FullCalendar plugins
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction"; // optional

// Correct CSS imports for v6+
import "@fullcalendar/common/main.css"; // core styles
import "@fullcalendar/daygrid/main.css"; // daygrid styles
import "@fullcalendar/timegrid/main.css"; // timegrid styles

import "bootstrap/dist/css/bootstrap.min.css";




const CalendarEvents = ({ token }) => {
  const [events, setEvents] = useState([]);
  const [popupMessage, setPopupMessage] = useState("");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/events", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const formatted = data.map((e) => ({
        id: e.id,
        title: e.title,
        start: e.startTime,
        end: e.endTime,
        color: e.status === "BUSY" ? "#f44336" : "#4caf50",
      }));
      setEvents(formatted);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDateClick = async (info) => {
    const title = prompt("Enter event title:");
    if (!title) return;

    const startTime = info.dateStr;
    const endTime = new Date(info.date);
    endTime.setHours(endTime.getHours() + 1);

    try {
      const res = await fetch("http://localhost:8000/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, startTime, endTime }),
      });
      const data = await res.json();
      if (res.ok) {
        setPopupMessage("Event created successfully!");
        setEvents([
          ...events,
          {
            id: data.event.id,
            title: data.event.title,
            start: data.event.startTime,
            end: data.event.endTime,
            color: data.event.status === "BUSY" ? "#f44336" : "#4caf50",
          },
        ]);
        setTimeout(() => setPopupMessage(""), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      {popupMessage && (
        <div
          className="position-fixed top-0 end-0 m-3 p-3 rounded shadow text-white"
          style={{ backgroundColor: "#4caf50", zIndex: 9999 }}
        >
          {popupMessage}
        </div>
      )}

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={events}
        dateClick={handleDateClick}
        height="auto"
        nowIndicator={true}
      />
    </div>
  );
};

export default CalendarEvents;
