import React, { useState } from "react";
import Certificate from "./Certificate";
import Year from "./Year";
import Rating from "./Rating";
import ScatterPlot from "./ScatterPlot";
import Genre from "./Genre";

const Statistics = () => {
  const [activeChart, setActiveChart] = useState("Genre");

  const charts = [
    { key: "Genre", label: "Genre Distribution", Component: Genre },
    {
      key: "Certificate",
      label: "Certificate Distribution",
      Component: Certificate,
    },
    { key: "Rating", label: "Rating Distribution", Component: Rating },
    { key: "Year", label: "Year Distribution", Component: Year },
    { key: "ScatterPlot", label: "Scatter Plot", Component: ScatterPlot },
  ];

  const renderChart = () => {
    const Chart = charts.find((c) => c.key === activeChart);
    return Chart ? <Chart.Component /> : null;
  };

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        {charts.map((chart) => (
          <button
            key={chart.key}
            onClick={() => setActiveChart(chart.key)}
            style={{
              marginRight: "10px",
              padding: "10px 15px",
              cursor: "pointer",
              backgroundColor:
                activeChart === chart.key ? "#007bff" : "#f0f0f0",
              color: activeChart === chart.key ? "white" : "black",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          >
            {chart.label}
          </button>
        ))}
      </div>

      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          border: "1px solid #ccc",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {renderChart()}
      </div>
    </div>
  );
};

export default Statistics;
