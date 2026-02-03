import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const CDN_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://cdn.jsdelivr.net/gh/nsmwce/webapp@main'
  : '';

const Materials = () => {
  const { topicId } = useParams();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${CDN_BASE}/data/nsm-database.materials.json`)
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter((mat) => mat.topic === topicId);
        setMaterials(filtered);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching materials:", error);
        setLoading(false);
      });
  }, [topicId]);

  return (
    <div style={{ padding: "2rem" }}>
      <h2 style={{ textTransform: "capitalize" }}>{topicId} Materials</h2>

      {loading ? (
        <p>Loading...</p>
      ) : materials.length > 0 ? (
        <ul>
          {materials.map((mat) => (
            <li key={mat._id?.$oid} style={{ marginBottom: "10px" }}>
              <a href={mat.url || "#"} target="_blank" rel="noreferrer">
                {mat.title}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p>No materials available for this topic.</p>
      )}
    </div>
  );
};

export default Materials;
