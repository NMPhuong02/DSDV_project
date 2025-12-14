import * as d3 from "d3";
import React, { useEffect, useRef } from "react";
import Data from "./../../data/data.csv";

const GRAPH_PROPERTY = { width: 1200, height: 700, margin: 90 };

export default function BarChart() {
  const ref = useRef();

  useEffect(() => {
    d3.csv(Data).then((csvData) => {
      const dataByCert = {};

      csvData.forEach((item) => {
        const cert = item.certificate ? item.certificate.trim() : "Unknown";
        const rating = parseFloat(item.rating);

        if (cert && !isNaN(rating)) {
          if (!dataByCert[cert]) {
            dataByCert[cert] = {
              count: 0,
              totalRating: 0,
              avgRating: 0,
              certificate: cert,
            };
          }
          dataByCert[cert].count += 1;
          dataByCert[cert].totalRating += rating;
        }
      });

      let dataArray = Object.values(dataByCert).map((d) => {
        d.avgRating = d.totalRating / d.count;
        return d;
      });

      dataArray = dataArray
        .filter((d) => d.count > 1)
        .sort((a, b) => b.count - a.count);

      if (dataArray.length === 0) {
        console.warn("No valid certificate data found for charting.");
        return;
      }

      const chartWidth = GRAPH_PROPERTY.width - GRAPH_PROPERTY.margin * 2;
      const chartHeight = GRAPH_PROPERTY.height - GRAPH_PROPERTY.margin * 2;

      const certNames = dataArray.map((d) => d.certificate);
      const maxCount = d3.max(dataArray, (d) => d.count) || 0;
      const minRating = d3.min(dataArray, (d) => d.avgRating) || 0;
      const maxRating = d3.max(dataArray, (d) => d.avgRating) || 10;

      const xScale = d3
        .scaleLinear()
        .domain([0, maxCount * 1.1])
        .range([0, chartWidth]);

      const yScale = d3
        .scaleBand()
        .domain(certNames)
        .range([0, chartHeight])
        .padding(0.2);

      const colorScale = d3
        .scaleLinear()
        .domain([minRating, maxRating])
        .range(["#ADD8E6", "#00008B"]);

      const xAxis = d3.axisBottom(xScale).ticks(5).tickFormat(d3.format("d"));

      const yAxis = d3.axisLeft(yScale);

      const svgElement = d3
        .select(ref.current)
        .attr("width", GRAPH_PROPERTY.width)
        .attr("height", GRAPH_PROPERTY.height);

      svgElement.selectAll("*").remove();

      const g = svgElement
        .append("g")
        .attr(
          "transform",
          `translate(${GRAPH_PROPERTY.margin}, ${GRAPH_PROPERTY.margin})`
        );

      const tooltip = d3
        .select("body")
        .append("div")
        .attr("id", "tooltip-cert")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px")
        .style("pointer-events", "none");

      g.append("g")
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(xAxis)
        .style("font-size", "14px");

      g.append("g").call(yAxis).style("font-size", "14px");

      g.selectAll(".bar")
        .data(dataArray)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", xScale(0))
        .attr("y", (d) => yScale(d.certificate) || 0)
        .attr("height", yScale.bandwidth())
        .attr("width", (d) => xScale(d.count))
        .attr("fill", (d) => colorScale(d.avgRating))
        .style("stroke", "black")
        .style("stroke-width", 0.5)
        .on("mouseover", function (event, d) {
          d3.select(this).style("fill", "#ff7f0e");
          tooltip
            .html(
              `Certificate: ${d.certificate}<br/>` +
                `Count: ${d.count}<br/>` +
                `Avg Rating: ${d.avgRating.toFixed(2)}`
            )
            .style("visibility", "visible");
        })
        .on("mousemove", function (event) {
          tooltip
            .style("top", event.pageY - 10 + "px")
            .style("left", event.pageX + 10 + "px");
        })
        .on("mouseout", function (event, d) {
          d3.select(this).style("fill", colorScale(d.avgRating));
          tooltip.style("visibility", "hidden");
        });

      g.selectAll(".label")
        .data(dataArray)
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("x", (d) => xScale(d.count) + 5)
        .attr(
          "y",
          (d) => (yScale(d.certificate) || 0) + yScale.bandwidth() / 2 + 4
        )
        .text((d) => d.count)
        .style("font-size", "12px")
        .style("fill", "black");

      g.append("text")
        .attr(
          "transform",
          `translate(${chartWidth / 2}, ${
            chartHeight + GRAPH_PROPERTY.margin / 2
          })`
        )
        .style("text-anchor", "middle")
        .style("font-size", "18px")
        .text("Number of Movies");
    });

    return () => {
      d3.select("body").select("#tooltip-cert").remove();
    };
  }, []);

  return (
    <div>
      <h3>Movie Distribution by Certificate</h3>
      <svg
        ref={ref}
        style={{ width: GRAPH_PROPERTY.width, height: GRAPH_PROPERTY.height }}
      />
    </div>
  );
}
