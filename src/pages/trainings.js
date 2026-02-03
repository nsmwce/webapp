import React from "react";
import { useNavigate } from "react-router-dom";

const topics = [
  {
    id: 1,
    slug: "openmp",
    title: "OpenMP",
    description: "Learn about OpenMP models and techniques.",
  },
  {
    id: 2,
    slug: "mpi",
    title: "MPI",
    description: "Understand cloud-based architectures and virtualization.",
  },
  {
    id: 3,
    slug: "cuda",
    title: "CUDA",
    description: "Explore large-scale data processing and analysis methods.",
  },
  {
    id:4,
    slug:"ai",
    title:"Aritificial Intelligence",
    description:"Dive down to the different intelligence network.",
  },
];

const Trainings = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto", fontFamily:"Montserrat"}}>
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
        Trainings Programs Under NSM
      </h2>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          marginTop: "30px",
        }}
      >
        {topics.map((topic) => (
          <div
            key={topic.id}
            onClick={() => navigate(`/materials/${topic.slug}`)}
            style={{
              padding: "20px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "0.3s",
              background: "#f9f9f9",
              width: "30%",
              textAlign: "center",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#ddd")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#f9f9f9")}
          >
            <h3>{topic.title}</h3>
            <p>{topic.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Trainings;
