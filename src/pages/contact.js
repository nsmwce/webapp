import React from "react";
import {FaEnvelope } from "react-icons/fa";
import { MdOutlineContactMail } from "react-icons/md";
import { FaMapPin } from "react-icons/fa";
const Contact = () => {
  return (
    <div style={styles.container}>
      <h2 style={{
          marginBottom: "20px",
          color: "#003366",
          justifyContent: "center",
          textAlign: "center",
          fontFamily:"Montserrat"
        }}>Contact Us</h2>

      <div style={styles.infoBox}>
        <h3><FaMapPin style={{marginRight:"8px"}} /> Address:</h3>
        <p>Walchand College of Engineering, Vishrambag, Sangli, Maharashtra 416415</p>

        <h3><FaEnvelope style={{marginRight:"8px"}}/>Email:</h3>
        <p>
          <a href="mailto:nsmnc@walchandsangli.ac.in" style={styles.link}>
          nsmnc@walchandsangli.ac.in
          </a>
        </p>
      </div>

      <div style={styles.mapBox}>
      <iframe
    title="Walchand College of Engineering Map"
    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3818.609076472004!2d74.59888257492179!3d16.845738683952064!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc1237f52c65db5%3A0xa3535676176ded0a!2sWalchand%20College%20of%20Engineering!5e0!3m2!1sen!2sin!4v1744906758542!5m2!1sen!2sin"
    width="100%"
    height="400"
    style={{ border: 0 }}
    allowFullScreen=""
    loading="lazy"
    referrerPolicy="no-referrer-when-downgrade"
  ></iframe>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "40px",
    maxWidth: "1000px",
    margin: "0 auto",
    fontFamily: "Segoe UI, sans-serif",
  },
  heading: {
    textAlign: "center",
    color: "#003366",
    marginBottom: "30px",
  },
  infoBox: {
    background: "#f4f4f4",
    padding: "20px",
    borderRadius: "8px",
    marginBottom: "30px",
  },
  link: {
    color: "#004080",
    textDecoration: "none",
  },
  mapBox: {
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },
};

export default Contact;
