// React: ImageUpload.js
import React, { useState } from "react";
import axios from "axios";

function ImageUpload() {
  const [file, setFile] = useState(null);
  const [prediction, setPrediction] = useState("");

  const handleChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    const res = await axios.post("http://localhost:5000/predict", formData);
    setPrediction(res.data.prediction);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleChange} />
        <button type="submit">Predict</button>
      </form>
      {prediction && <p>Prediction: {prediction}</p>}
    </div>
  );
}

export default ImageUpload;
