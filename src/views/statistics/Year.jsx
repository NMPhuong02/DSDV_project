import * as d3 from "d3";
import React, { useEffect, useRef } from "react";
import Data from "./../../data/data.csv";

const GRAPH_PROPERTY = { width: 1200, height: 1000, margin: 70 };
const CHART_WIDTH = GRAPH_PROPERTY.width - GRAPH_PROPERTY.margin * 2;
const SINGLE_CHART_HEIGHT =
  (GRAPH_PROPERTY.height - GRAPH_PROPERTY.margin * 3) / 2;
const CHART_HEIGHT_TOTAL = SINGLE_CHART_HEIGHT;

export default function LineChart() {
  const ref = useRef();

  const SPLIT_YEAR = 1970;

  useEffect(() => {
    d3.csv(Data).then((csvData) => {
      const data = csvData
        .map((d) => ({
          year: parseFloat(d.year),
          budget: parseFloat(d.budget),
          box_office: parseFloat(d.box_office),
        }))
        .filter(
          (d) => !isNaN(d.year) && !isNaN(d.budget) && !isNaN(d.box_office)
        );

      const metricsByYear = {};
      data.forEach((item) => {
        if (!metricsByYear[item.year]) {
          metricsByYear[item.year] = { budgets: [], boxOffices: [] };
        }
        metricsByYear[item.year].budgets.push(item.budget);
        metricsByYear[item.year].boxOffices.push(item.box_office);
      });

      const averageMetricsByYear = Object.entries(metricsByYear)
        .map(([year, metrics]) => {
          return {
            year: parseFloat(year),
            averageBudget: d3.mean(metrics.budgets),
            averageBoxOffice: d3.mean(metrics.boxOffices),
            count: metrics.budgets.length,
          };
        })
        .sort((a, b) => a.year - b.year);

      const dataPre1970 = averageMetricsByYear.filter(
        (d) => d.year <= SPLIT_YEAR
      );
      const dataPost1970 = averageMetricsByYear.filter(
        (d) => d.year > SPLIT_YEAR
      );

      if (dataPre1970.length === 0 || dataPost1970.length === 0) {
        console.warn(
          "One of the datasets (pre/post 1970) is empty after filtering."
        );
      }

      const svgElement = d3.select(ref.current);
      svgElement.selectAll("*").remove();

      const Y_AXIS_TRANSLATE = GRAPH_PROPERTY.margin;
      const X_AXIS_TRANSLATE = GRAPH_PROPERTY.margin;
      const yAxisFormat = d3.format(".2s");

      let tooltip = d3.select("body").select("#tooltip-linechart");
      if (tooltip.empty()) {
        tooltip = d3
          .select("body")
          .append("div")
          .attr("id", "tooltip-linechart")
          .style("position", "absolute")
          .style("visibility", "hidden")
          .style("background-color", "white")
          .style("border", "solid")
          .style("border-width", "1px")
          .style("border-radius", "5px")
          .style("padding", "10px")
          .style("pointer-events", "none");
      }

      const drawChart = (data, chartIndex, title) => {
        const translateY =
          Y_AXIS_TRANSLATE +
          chartIndex * (SINGLE_CHART_HEIGHT + GRAPH_PROPERTY.margin);

        const xDomainMin = d3.min(data, (d) => d.year) - 1;
        const xDomainMax = d3.max(data, (d) => d.year) + 1;

        const xScale = d3
          .scaleLinear()
          .domain([xDomainMin, xDomainMax])
          .range([0, CHART_WIDTH]);

        const xAxis = d3
          .axisBottom(xScale)
          .ticks(Math.min(10, xDomainMax - xDomainMin + 2))
          .tickFormat(d3.format("d"));

        const maxLocalAvgBudget = d3.max(data, (d) => d.averageBudget) || 0;
        const maxLocalAvgBoxOffice =
          d3.max(data, (d) => d.averageBoxOffice) || 0;
        const maxLocalOverallAverage = Math.max(
          maxLocalAvgBudget,
          maxLocalAvgBoxOffice
        );
        const yDomainMaxLocal = maxLocalOverallAverage * 1.05;

        const minLocalAvgBudget = d3.min(data, (d) => d.averageBudget) || 0;
        const minLocalAvgBoxOffice =
          d3.min(data, (d) => d.averageBoxOffice) || 0;
        const minLocalOverallAverage = Math.min(
          minLocalAvgBudget,
          minLocalAvgBoxOffice
        );
        const yDomainMinLocal = Math.max(0, minLocalOverallAverage * 0.95);

        const yScale = d3
          .scaleLinear()
          .domain([yDomainMinLocal, yDomainMaxLocal])
          .range([CHART_HEIGHT_TOTAL, 0]);

        const yAxis = d3.axisLeft(yScale).ticks(10).tickFormat(yAxisFormat);

        const g = svgElement
          .append("g")
          .attr("transform", `translate(${X_AXIS_TRANSLATE}, ${translateY})`);

        g.append("g")
          .attr("transform", `translate(0, ${CHART_HEIGHT_TOTAL})`)
          .call(xAxis)
          .selectAll("text")
          .style("text-anchor", "middle")
          .attr("dx", "0")
          .attr("dy", ".71em")
          .attr("transform", "rotate(0)");

        g.append("g").call(yAxis);

        const budgetLine = d3
          .line()
          .x((d) => xScale(d.year))
          .y((d) => yScale(d.averageBudget));

        const boxOfficeLine = d3
          .line()
          .x((d) => xScale(d.year))
          .y((d) => yScale(d.averageBoxOffice));

        g.append("path")
          .datum(data)
          .attr("fill", "none")
          .attr("stroke", "steelblue")
          .attr("stroke-width", 2.5)
          .attr("d", budgetLine);

        g.append("path")
          .datum(data)
          .attr("fill", "none")
          .attr("stroke", "#ff7f0e")
          .attr("stroke-width", 2.5)
          .attr("d", boxOfficeLine);

        const drawPoints = (metricKey, color, label) => {
          g.selectAll(`dot-${metricKey}-${chartIndex}`)
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", (d) => xScale(d.year))
            .attr("cy", (d) => yScale(d[metricKey]))
            .attr("r", 4)
            .attr("fill", color)
            .attr("stroke", "white")
            .on("mouseover", function (event, d) {
              d3.select(this).attr("r", 6);
              tooltip
                .html(
                  `**${label}**<br/>Year: ${d.year.toFixed(
                    0
                  )}<br/>Avg Value: ${yAxisFormat(d[metricKey])}<br/>Movies: ${
                    d.count
                  }`
                )
                .style("visibility", "visible");
            })
            .on("mousemove", function (event) {
              tooltip
                .style("top", event.pageY - 10 + "px")
                .style("left", event.pageX + 10 + "px");
            })
            .on("mouseout", function () {
              d3.select(this).attr("r", 4);
              tooltip.style("visibility", "hidden");
            });
        };

        drawPoints("averageBudget", "steelblue", "Average Budget");
        drawPoints("averageBoxOffice", "#ff7f0e", "Average Box Office");

        g.append("text")
          .attr("x", CHART_WIDTH / 2)
          .attr("y", -10)
          .attr("text-anchor", "middle")
          .style("font-size", "18px")
          .style("font-weight", "bold")
          .text(title);
      };

      drawChart(
        dataPre1970,
        0,
        `Average Budget vs. Box Office (Years <= ${SPLIT_YEAR})`
      );

      drawChart(
        dataPost1970,
        1,
        `Average Budget vs. Box Office (Years > ${SPLIT_YEAR})`
      );

      const legendTranslateY =
        Y_AXIS_TRANSLATE + SINGLE_CHART_HEIGHT + GRAPH_PROPERTY.margin / 2;

      svgElement
        .append("text")
        .attr(
          "transform",
          `translate(30, ${
            Y_AXIS_TRANSLATE + GRAPH_PROPERTY.height / 2
          }) rotate(-90)`
        )
        .text("Average Value (Budget/Box Office)")
        .style("text-anchor", "middle")
        .style("font-size", "20px")
        .style("font-weight", "bold");

      svgElement
        .append("text")
        .attr(
          "transform",
          `translate(${X_AXIS_TRANSLATE + CHART_WIDTH / 2}, ${
            GRAPH_PROPERTY.height - 10
          })`
        )
        .text("Years")
        .style("text-anchor", "middle")
        .style("font-size", "20px")
        .style("font-weight", "bold");

      const legend = svgElement
        .append("g")
        .attr(
          "transform",
          `translate(${GRAPH_PROPERTY.width - 200}, ${legendTranslateY})`
        );

      legend
        .append("rect")
        .attr("x", 0)
        .attr("y", -20)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", "steelblue");
      legend
        .append("text")
        .attr("x", 20)
        .attr("y", -10)
        .text("Avg Budget")
        .style("font-size", "14px")
        .attr("alignment-baseline", "middle");

      legend
        .append("rect")
        .attr("x", 0)
        .attr("y", 5)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", "#ff7f0e");
      legend
        .append("text")
        .attr("x", 20)
        .attr("y", 15)
        .text("Avg Box Office")
        .style("font-size", "14px")
        .attr("alignment-baseline", "middle");
    });

    return () => {
      d3.select("body").select("#tooltip-linechart").remove();
    };
  }, []);

  return (
    <div>
      <h3>Average Movie Budget vs. Box Office Revenue (Pre and Post 1970)</h3>
      <svg
        ref={ref}
        width={GRAPH_PROPERTY.width}
        height={GRAPH_PROPERTY.height}
      ></svg>
    </div>
  );
}
