import React, { useEffect, useState } from "react";

const CDN_BASE = 'https://cdn.jsdelivr.net/gh/nsmwce/webapp@main/build';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${CDN_BASE}/data/nsm-database.events.json`)
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching events:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "Montserrat" }}>
      <h2
        style={{
          background: "#004080",
          width: "100%",
          height: "50px",
          color: "white",
          justifyContent: "center",
          textAlign: "center",
          lineHeight: "50px",
        }}
      >
        Event Reports
      </h2>

      {loading ? (
        <p style={{ textAlign: "center", fontStyle: "italic" }}>
          Loading events...
        </p>
      ) : events.length === 0 ? (
        <p>No events uploaded yet.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={thStyle}>Events</th>
              <th style={thStyle}>Conducted on</th>
              <th style={thStyle}>Location</th>
              <th style={thStyle}>No. Of Participants</th>
              <th style={thStyle}>Agenda</th>
              {/* <th style={thStyle}>Report</th> */}
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event._id}>
                <td style={tdStyle}>{event.title}</td>
                <td style={tdStyle}>
                  {event.month}, {event.year}
                </td>
                <td style={tdStyle}>{event.location}</td>
                <td style={tdStyle}>{event.participants}</td>
                <td style={tdStyle}>{event.summary}</td>
                {/* <td style={tdStyle}>
                  <a
                    href={`${STATIC_BASE_URL}/api/events/${event._id}/file`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: "#004080",
                      textDecoration: "underline",
                      fontWeight: "500",
                    }}
                  >
                    View Report
                  </a>
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const thStyle = {
  textAlign: "center",
  padding: "10px",
  background: "#004080",
  color: "white",
  border: "1px solid #ddd",
};

const tdStyle = {
  padding: "10px",
  border: "1px solid #ddd",
  textAlign: "center",
};

export default Events;
