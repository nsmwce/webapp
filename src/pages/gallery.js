import React, { useEffect, useState } from "react";

const CDN_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://cdn.jsdelivr.net/gh/nsmwce/webapp@main/build'
  : '';

const Gallery = () => {
  const [eventPhotos, setEventPhotos] = useState([]);

  useEffect(() => {
    fetch(`${CDN_BASE}/data/nsm-database.eventphotos.json`)
      .then((res) => res.json())
      .then((data) => setEventPhotos(data))
      .catch((err) => console.error("Error loading gallery:", err));
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily:"Montserrat" }}>
      <h2
        style={{
           background: "#004080",
            width:"100%",
            height: "50px",
            color: "white",
            justifyContent:"center",
            textAlign:"center",
        }}
      >
        Event Gallery
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        {eventPhotos.map((photo) => {
          const photoSrc = photo.image 
            ? `${CDN_BASE}/images/${photo.image}`
            : "";
          return (
            <div
              key={photo._id?.$oid}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              {photoSrc && (
                <img
                  src={photoSrc}
                  alt={photo.caption || "Event photo"}
                  style={{ width: "100%", height: "200px", objectFit: "cover" }}
                />
              )}
              <div style={{ padding: "10px", background: "#f9f9f9" }}>
                <p
                  style={{
                    margin: 0,
                    fontWeight: "500",
                    textAlign: "center",
                    color: "#333",
                  }}
                >
                  {photo.caption || "No description provided"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Gallery;
