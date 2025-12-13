import React, { useState } from 'react'
import BarChart from './BarChart'
import LineChart from './LineChart'
import PieChart from './PieChart'
import ScatterPlot from './ScatterPlot'
import Histogram from './Histogram'

const Statistics = () => {
  const [activeChart, setActiveChart] = useState('Histogram')

  const charts = [
    { key: 'Histogram', label: 'Histogram', Component: Histogram },
    { key: 'LineChart', label: 'Line Chart', Component: LineChart },
    { key: 'PieChart', label: 'Pie Chart', Component: PieChart },
    { key: 'ScatterPlot', label: 'Scatter Plot', Component: ScatterPlot },
    { key: 'BarChart', label: 'Bar Chart', Component: BarChart },
  ]

  const renderChart = () => {
    const Chart = charts.find((c) => c.key === activeChart)
    return Chart ? <Chart.Component /> : null
  }

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        {charts.map((chart) => (
          <button
            key={chart.key}
            onClick={() => setActiveChart(chart.key)}
            style={{
              marginRight: '10px',
              padding: '10px 15px',
              cursor: 'pointer',
              backgroundColor: activeChart === chart.key ? '#007bff' : '#f0f0f0',
              color: activeChart === chart.key ? 'white' : 'black',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          >
            {chart.label}
          </button>
        ))}
      </div>

      <div
        style={{
          backgroundColor: 'white',
          padding: '20px',
          border: '1px solid #ccc',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {renderChart()}
      </div>
    </div>
  )
}

export default Statistics
