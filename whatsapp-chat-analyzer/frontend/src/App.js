import React, { useState } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import "./App.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const API_BASE_URL = "http://localhost:5000/api/chat";

function App() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [analysisData, setAnalysisData] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === "text/plain" || selectedFile.name.endsWith(".txt")) {
        setFile(selectedFile);
        setFileName(selectedFile.name);
        setError("");
        setSuccess("");
      } else {
        setError("Please upload a .txt file only.");
        setFile(null);
        setFileName("");
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("chatFile", file);

      // Don't set Content-Type manually - axios will set it with boundary
      const response = await axios.post(`${API_BASE_URL}/upload`, formData);

      setSuccess("File uploaded and analyzed successfully!");
      setAnalysisData(response.data);
    } catch (err) {
      console.error("Upload error:", err);
      
      // Better error messages
      let errorMsg = "Failed to upload file. ";
      
      if (err.code === "ERR_NETWORK" || err.message.includes("Network Error")) {
        errorMsg += "Cannot connect to backend. Make sure backend server is running on http://localhost:5000";
      } else if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.response?.status) {
        errorMsg += `Server returned error ${err.response.status}`;
      } else {
        errorMsg += err.message || "Please try again.";
      }
      
      setError(errorMsg);
      setAnalysisData(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const chartData = analysisData?.dailyStats
    ? {
        labels: analysisData.dailyStats.map((stat) => formatDate(stat.date)),
        datasets: [
          {
            label: "Daily Active Users",
            data: analysisData.dailyStats.map((stat) => stat.activeUsers),
            backgroundColor: "rgba(102, 126, 234, 0.8)",
            borderColor: "rgba(102, 126, 234, 1)",
            borderWidth: 2,
          },
          {
            label: "Daily New Users",
            data: analysisData.dailyStats.map((stat) => stat.newUsers),
            backgroundColor: "rgba(255, 159, 64, 0.8)",
            borderColor: "rgba(255, 159, 64, 1)",
            borderWidth: 2,
          },
        ],
      }
    : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "User Activity (Last 7 Days)",
        font: {
          size: 18,
          weight: "bold",
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="app">
      <div className="header">
        <h1>📊 WhatsApp Chat Analyzer</h1>
        <p>Analyze your group chat activity for the last 7 days</p>
      </div>

      <div className="upload-section">
        <div className="upload-box">
          <h2>Upload WhatsApp Chat File</h2>
          <p style={{ marginTop: "10px", color: "#666" }}>
            Select your exported WhatsApp group chat .txt file
          </p>

          <div className="file-input-wrapper">
            <input
              type="file"
              id="fileInput"
              accept=".txt"
              onChange={handleFileChange}
              disabled={loading}
            />
            <label htmlFor="fileInput" className="file-label">
              {fileName ? "Change File" : "Choose File"}
            </label>
          </div>

          {fileName && (
            <div className="file-name">Selected: {fileName}</div>
          )}

          <button
            className="upload-button"
            onClick={handleUpload}
            disabled={!file || loading}
          >
            {loading ? "Analyzing..." : "Upload & Analyze"}
          </button>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
        </div>
      </div>

      {analysisData && (
        <div className="results-section">
          <div className="chart-container">
            <div className="chart-title">📈 Activity Graph</div>
            {chartData ? (
              <Bar data={chartData} options={chartOptions} />
            ) : (
              <div className="empty-state">No data available</div>
            )}
          </div>

          <div className="power-users-container">
            <div className="power-users-title">
              ⭐ Power Users (Active ≥ 4 Days)
            </div>
            {analysisData.powerUsers && analysisData.powerUsers.length > 0 ? (
              <ul className="power-users-list">
                {analysisData.powerUsers.map((powerUser, index) => (
                  <li key={index} className="power-user-item">
                    <span className="power-user-name">{powerUser.user}</span>
                    <span className="power-user-days">
                      {powerUser.activeDays} days
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty-state">
                No users were active on 4 or more days in the last 7 days.
              </div>
            )}
          </div>

          {analysisData.window && (
            <div style={{ 
              background: "white", 
              borderRadius: "15px", 
              padding: "20px", 
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              textAlign: "center",
              color: "#666"
            }}>
              <strong>Analysis Period:</strong> {formatDate(analysisData.window.start)} - {formatDate(analysisData.window.end)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
