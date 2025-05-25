import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setPrediction(null);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await axios.post('http://localhost:5000/predict', formData);
      setPrediction(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to make prediction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <h1>Apricot Disease Detector</h1>
      <span style={{fontSize: "25px", position: "relative", top: "-10px"}}>By: Agha Naveed</span>
      <br />
      <div className="upload-container">
        <label className="file-input-label">
          Choose Image
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange}
            className="file-input"
          />
        </label>
        
        {preview && (
          <div className="image-preview">
            <img src={preview} alt="Preview" />
          </div>
        )}
        
        <button 
          onClick={handleSubmit} 
          disabled={!selectedFile || loading}
          className="predict-button"
        >
          {loading ? 'Processing...' : 'Predict Disease'}
        </button>
        
        {error && <p className="error-message">{error}</p>}
        
        {prediction && (
          <div className="result-container">
            <h3>Prediction Result:</h3>
            <p>Disease: {prediction.class}</p>
            <p>Confidence: {prediction.confidence}%</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;