import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const CDN_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://cdn.jsdelivr.net/gh/nsmwce/webapp@main/build'
  : '';

const Home = () => {
  const [importantLinks, setImportantLinks] = useState([]);
  const [coordinators, setCoordinators] = useState([]);
  const [sisterCenters, setSisterCenters] = useState([]);

  useEffect(() => {
    fetch(`${CDN_BASE}/data/nsm-database.importantlinks.json`)
      .then((res) => res.json())
      .then((data) => setImportantLinks(data))
      .catch((err) => console.error("Important links error:", err));

    fetch(`${CDN_BASE}/data/nsm-database.coordinators.json`)
      .then((res) => res.json())
      .then((data) => setCoordinators(data))
      .catch((err) => console.error("Coordinators error:", err));

    fetch(`${CDN_BASE}/data/nsm-database.sisternodals.json`)
      .then((res) => res.json())
      .then((data) => setSisterCenters(data))
      .catch((err) => console.error("Sister centers error:", err));
  }, []);

  return (
    <div
      style={{
        padding: "20px",
        width: "100%",
        minHeight: "100vh",
        boxSizing: "border-box",
        boxShadow:"",
        backgroundColor: "#f2f6fa",
        fontFamily:"Montserrat"
      }}
    >
       {/* About Us Section */}
      <section id="aboutus">
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
          About WCE Nodal Center
        </h2>
        <div
          style={{
            background:"#ffff",
            borderRadius:"5px",
            padding: "25px",
            fontSize: "16px",
            textAlign: "justify",
            color: "#333",
          }}
        >
          <p>
            <strong>Walchand College of Engineering, Sangli</strong> has been
            selected as a nodal center under the prestigious{" "}
            <strong>National Supercomputing Mission (NSM)</strong>, an
            initiative by the Government of India. This mission aims to empower
            academic and R&D institutions nationwide by deploying supercomputers
            and fostering a highly skilled workforce in High-Performance
            Computing (HPC).
          </p>
          <p>
            As part of this initiative, WCE organizes various training programs
            for faculty and students, including:
          </p>
          <ul
            style={{
              paddingLeft: "20px",
              marginTop: "-10px",
              marginBottom: "10px",
            }}
          >
            <li>
              <strong>One-Day Orientation Program:</strong> For HoDs and BoS
              members, showcasing the role of HPC in AI and other emerging
              technologies.
            </li>
            <li>
              <strong>Five-Day Faculty Development Program (FDP):</strong>{" "}
              Hands-on workshops to train faculty in HPC and AI integration.
            </li>
            <li>
              <strong>Summer-Winter School:</strong> Intensive programs for
              undergraduate students.
            </li>
          </ul>
          <p>
            These programs are <strong>completely free</strong> for
            participants, with food and accommodation provided. Host institutes
            receive overhead expenses while contributing nominal charges to the
            nodal center.
          </p>
          <p>
            <strong>Benefits:</strong>
            <ol>
              <li>Collaboration under NSM </li>
              <li>Exposure to cutting-edge technologies</li>
              <li>Local coordination support.</li>
            </ol>
          </p>
          <b>
            We look forward to collaborating with you to promote excellence in
            HPC and AI education and research.
          </b>
        </div>
      </section>
      
      {/* Important Links Section */}
      <section style={{ marginTop: "20px", textAlign: "center" }}>
        <h2
          style={{
            background: "#004080",
            height: "50px",
            color: "white",
            lineHeight: "50px",
          }}
        >
          Important Links
        </h2>
        <ul
          style={{
            columns: 2,
            columnGap: "100px",
            maxWidth: "600px",
            margin: "20px auto",
            paddingLeft: "20px",
            listStyleType: "disc",
            textAlign: "left",
          }}
        >
          {importantLinks.map((link, index) => (
            <li key={index} style={{ marginBottom: "10px" }}>
              <a
                href={link.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#004080",
                  textDecoration: "none",
                  fontWeight: "500",
                }}
              >
                {link.title}
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* Coordinators Section */}
      <section style={{ marginTop: "20px", textAlign: "center" }}>
        <h2 style={{ background: "#004080", height: "50px", color: "white" }}>
          Coordinators
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "20px",
            marginTop: "20px",
          }}
        >
          {coordinators.map((coordinator, index) => {
            const photoSrc = coordinator.photo 
              ? `${CDN_BASE}/images/${coordinator.photo}`
              : "";
            return (
              <div key={index} style={{ textAlign: "center" }}>
                <a href={coordinator.url} target="_blank" rel="noreferrer">
                  {photoSrc && (
                    <img
                      src={photoSrc}
                      alt={coordinator.name}
                      style={{
                        width: "100px",
                        height: "100px",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  )}
                </a>
                <p>{coordinator.name} </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Sister Nodal Centers Section */}
      <section style={{ marginTop: "20px", textAlign: "center" }}>
        <h2 style={{ background: "#004080", height: "50px", color: "white" }}>
          NSM Nodal Centers
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "20px",
            marginTop: "20px",
          }}
        >
          {sisterCenters.map((node, index) => {
            const photoSrc = node.photo 
              ? `${CDN_BASE}/images/${node.photo}`
              : "";
            return (
              <div key={index}>
                <a
                  href={node.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "black", textDecoration: "none" }}
                >
                  {photoSrc && (
                    <img
                      src={photoSrc}
                      alt={node.name}
                      style={{
                        width: "100px",
                        height: "100px",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  )}
                  <p>{node.name}</p>
                </a>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Home;
