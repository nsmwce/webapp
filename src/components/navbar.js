import React, { useState } from "react";
import { Link } from "react-router-dom";
import { IoInformationCircle } from "react-icons/io5";
import { FaHome, FaBook, FaCalendarAlt } from "react-icons/fa";
import { MdOutlineContactMail } from "react-icons/md";
import { MdPhotoLibrary } from "react-icons/md";
import { PiChalkboardTeacherBold } from "react-icons/pi";

const navItems = [
  { label: "About Us", path: "/#aboutus", icon: <IoInformationCircle /> },
  { label: "Trainings", path: "/trainings", icon: <PiChalkboardTeacherBold /> },
  { label: "Events", path: "/events", icon: <FaCalendarAlt /> },
  { label: "Gallery", path: "/gallery", icon: <MdPhotoLibrary /> },
  { label: "Contact Us", path: "/contact", icon: <MdOutlineContactMail /> },
];

const Navbar = () => {
  const [hoverIndex, setHoverIndex] = useState(null);

  const baseLinkStyle = {
    margin: "0 20px",
    textDecoration: "none",
    color: "#004080",
    display: "flex",
    alignItems: "center",
    padding: "6px 12px",
    borderRadius: "6px",
    transition: "background 0.3s ease, color 0.3s ease",
  };

  const hoverStyle = {
    backgroundColor: "#004080",
    color: "white",
  };

  return (
    <>
      <nav
        style={{
          display: "flex",
          position: "sticky",
          alignItems: "center",
          justifyContent: "center",
          padding: "10px",
          background: "white",
          color: "#004080",
          top: 0,
          zIndex: 99,
          fontFamily: "roboto",
          height: "100px",
        }}
      >
        <img
          src="/wce-logo.png"
          alt="Logo 1"
          style={{ height: "60px", marginRight: "10px" }}
        />
        <div style={{ textAlign: "center" }}>
          <h1 style={{ margin: "0", fontSize: "40px", fontWeight: "bold" }}>
            NSM Center for Training in HPC
          </h1>
          <h3 style={{ margin: "0", fontSize: "20px" }}>
            Walchand College of Engineering, Sangli
          </h3>
        </div>
        <img
          src="/nsm-logo.png"
          alt="Logo 2"
          style={{ height: "60px", marginLeft: "10px" }}
        />
      </nav>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          background: "#e0e0e0",
          color: "#004080",
          padding: "10px 0",
          fontFamily: "sans-serif",
          fontWeight: "500",
        }}
      >
        {navItems.map((item, index) => (
          <Link
            to={item.path}
            key={index}
            onMouseEnter={() => setHoverIndex(index)}
            onMouseLeave={() => setHoverIndex(null)}
            style={{
              ...baseLinkStyle,
              ...(hoverIndex === index ? hoverStyle : {}),
            }}
          >
            {item.icon}
            <span style={{ marginLeft: "8px" }}>{item.label}</span>
          </Link>
        ))}
      </div>
    </>
  );
};

export default Navbar;
