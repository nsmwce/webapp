import React from "react";
import { Link } from "react-router-dom";
import { IoInformationCircle } from "react-icons/io5";
import { FaHome,FaBook, FaCalendarAlt } from "react-icons/fa";
import { MdOutlineContactMail } from "react-icons/md";

const Navbar = () => {
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
          height:"100px",
        }}
      >
        <img
          src="/wce-logo.png"
          alt="Logo 1"
          style={{ height: "60px", marginRight: "10px" }}
        />
        <div style={{ textAlign: "center" }}>
          <h1 style={{ margin: "0", fontSize: "40px", fontWeight:"bold"}}>
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


    </>
  );
};

export default Navbar;
