import * as d3 from "d3";
import React, { useEffect, useRef } from "react";
import Data from "./../../data/data.csv";

const CHART_WIDTH = 800;
const CHART_HEIGHT = 500;
const CHART_MARGIN = 120;

export default function ScatterPlot() {
  const refPre = useRef();
  const refPost = useRef();

  useEffect(() => {
    d3.csv(Data).then((csvData) => {
      const allData = csvData
        .map((d) => ({
          ...d,
          year: parseFloat(d.year),
          rating: parseFloat(d.rating),
          box_office: parseFloat(d.box_office),
        }))
        .filter(
          (d) => !isNaN(d.year) && !isNaN(d.rating) && !isNaN(d.box_office)
        );

      const dataPre1970 = allData.filter((d) => d.year < 1970);
      const dataPost1970 = allData.filter((d) => d.year >= 1970);

      const sortedByBoxOfficeAll = [...allData].sort(
        (a, b) => b.box_office - a.box_office
      );
      const topTwoBoxOfficeMovies = sortedByBoxOfficeAll.slice(0, 2);
      const isTopTwo = (d) => topTwoBoxOfficeMovies.includes(d);

      const dataSets = [
        {
          id: "pre",
          ref: refPre,
          data: dataPre1970,
        },
        {
          id: "post",
          ref: refPost,
          data: dataPost1970,
        },
      ];

      dataSets.forEach(({ id, ref, data, title }) => {
        const svgElement = d3.select(ref.current);
        svgElement.selectAll("*").remove();

        if (data.length === 0) return;

        const sortedLocalData = [...data].sort(
          (a, b) => b.box_office - a.box_office
        );
        const minBoxOffice = d3.min(data, (d) => d.box_office);
        const maxBoxOfficeForScale =
          sortedLocalData.length >= 3
            ? sortedLocalData[2].box_office
            : d3.max(data, (d) => d.box_office);
        // -------------------------------------------------------------

        const minYear = d3.min(data, (d) => d.year);
        const maxYear = d3.max(data, (d) => d.year);
        const minRating = d3.min(data, (d) => d.rating);
        const maxRating = d3.max(data, (d) => d.rating);

        const xScale = d3
          .scaleLinear()
          .domain([minYear - 2, maxYear + 2])
          .range([0, CHART_WIDTH - CHART_MARGIN]);

        const yScale = d3
          .scaleLinear()
          .domain([minRating - 0.1, maxRating + 0.1])
          .range([CHART_HEIGHT - CHART_MARGIN, 0]);

        const colorScale = d3
          .scaleLinear()
          .domain([minBoxOffice, maxBoxOfficeForScale]) // Dynamic local scale
          .range(["white", "blue"]);

        const xAxis = d3.axisBottom(xScale).ticks(5).tickFormat(d3.format("d"));

        const yAxis = d3.axisLeft(yScale).ticks(10);

        // Title (Bold)
        svgElement
          .append("text")
          .attr("x", CHART_WIDTH / 2)
          .attr("y", 30)
          .attr("text-anchor", "middle")
          .style("font-size", "20px")
          .style("font-weight", "bold")
          .text(title);

        // X-Axis Label (Bold)
        svgElement
          .append("text")
          .attr(
            "transform",
            `translate(${CHART_WIDTH / 2 + 30},${CHART_HEIGHT - 40})`
          )
          .text("Year")
          .style("text-anchor", "middle")
          .style("font-size", "14px")
          .style("font-weight", "bold");

        // Y-Axis Label (Bold)
        svgElement
          .append("text")
          .attr("transform", `translate(30,${CHART_HEIGHT / 2})rotate(-90)`)
          .text("Rating")
          .style("text-anchor", "middle")
          .style("font-size", "14px")
          .style("font-weight", "bold");

        // Axes (Text within axes is not explicitly bolded here, but major labels are)
        svgElement
          .append("g")
          .attr(
            "transform",
            `translate(${CHART_MARGIN},${CHART_HEIGHT - CHART_MARGIN + 10})`
          )
          .call(xAxis);
        svgElement
          .append("g")
          .attr("transform", `translate(${CHART_MARGIN},10)`)
          .call(yAxis);

        let tooltip1 = d3
          .select("body")
          .append("div")
          .style("position", "absolute")
          .style("visibility", "hidden")
          .style("background-color", "white")
          .style("border", "solid")
          .style("border-width", "1px")
          .style("border-radius", "5px")
          .style("padding", "10px");

        let dots = svgElement.append("g").selectAll("dot").data(data);
        dots
          .enter()
          .append("circle")
          .attr("cx", function (d) {
            return xScale(d.year);
          })
          .attr("cy", function (d) {
            return yScale(d.rating);
          })
          .attr("r", 7)
          .attr("transform", `translate(${CHART_MARGIN},10)`)
          .style("fill", function (d) {
            // Top 2 overall are red, others use local color scale
            return isTopTwo(d) ? "red" : colorScale(d.box_office);
          })
          .style("opacity", (d) => {
            return colorScale(d.box_office) === "white" ? 0 : 0.7;
          })
          .style("stroke", (d) => (isTopTwo(d) ? "black" : "blue"))
          .style("stroke-width", (d) => (isTopTwo(d) ? "2px" : "1px"))
          .on("mouseover", mouseover)
          .on("mouseout", function (event, d) {
            d3.select(this)
              .style("stroke-width", (d) => (isTopTwo(d) ? "2px" : "1px"))
              .style("stroke", (d) => (isTopTwo(d) ? "black" : "blue"))
              .style("opacity", 0.7);
            tooltip1.style("visibility", "hidden");
          });

        function mouseover(event, d) {
          const seletedData = d3.select(this).data()[0];
          d3.select(this)
            .style("stroke-width", "3px")
            .style("stroke", "red")
            .style("opacity", 1);
          tooltip1
            .html(
              `
              <ul>
                <li>Movie: ${seletedData.name}</li>
                <li>Year: ${seletedData.year}</li>
                <li>Rating: ${seletedData.rating}</li>
                <li>Box Office: ${seletedData.box_office}</li>
              </ul>
              `
            )
            .style("visibility", "visible")
            .style("top", event.pageY - 10 + "px")
            .style("left", event.pageX + 10 + "px");
        }
      });
    });
  }, []);

  return (
    <div>
      <h3>Movie Rating vs. Year</h3>
      <div
        style={{
          display: "block",
          margin: "0 auto",
          width: `${CHART_WIDTH + CHART_MARGIN * 2}px`,
        }}
      >
        <svg
          ref={refPre}
          width={CHART_WIDTH + CHART_MARGIN}
          height={CHART_HEIGHT + CHART_MARGIN + 100}
          style={{ overflow: "visible", display: "block", margin: "0 auto" }}
        ></svg>
        <svg
          ref={refPost}
          width={CHART_WIDTH + CHART_MARGIN}
          height={CHART_HEIGHT + CHART_MARGIN}
          style={{ overflow: "visible", display: "block", margin: "0 auto" }}
        ></svg>
      </div>
    </div>
  );
}
