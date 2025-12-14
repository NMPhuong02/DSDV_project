import * as d3 from "d3";
import { useEffect, useRef } from "react";
import Data from "./../../data/data.csv";

const GRAPH_PROPERTY = {
  width: 1200,
  height: 500,
  margin: { top: 30, right: 30, bottom: 90, left: 60 },
};

export default function Histogram() {
  const ref = useRef();

  useEffect(() => {
    const innerWidth =
      GRAPH_PROPERTY.width -
      GRAPH_PROPERTY.margin.left -
      GRAPH_PROPERTY.margin.right;
    const innerHeight =
      GRAPH_PROPERTY.height -
      GRAPH_PROPERTY.margin.top -
      GRAPH_PROPERTY.margin.bottom;

    d3.csv(Data).then((csvData) => {
      const allGenres = csvData
        .map((item) => item.genre.split(",").map((g) => g.trim()))
        .flat();

      let data = {};
      allGenres.forEach((item) => {
        if (item) {
          if (data[item] === undefined) {
            data[item] = 1;
          } else {
            data[item] = data[item] + 1;
          }
        }
      });

      const dataArray = Object.entries(data).map(([genre, count]) => ({
        genre,
        count,
      }));
      dataArray.sort((a, b) => b.count - a.count);

      const svgElement = d3
        .select(ref.current)
        .attr("width", GRAPH_PROPERTY.width)
        .attr("height", GRAPH_PROPERTY.height);

      svgElement.selectAll("*").remove();

      const g = svgElement
        .append("g")
        .attr(
          "transform",
          `translate(${GRAPH_PROPERTY.margin.left}, ${GRAPH_PROPERTY.margin.top})`
        );

      const tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "5px")
        .style("pointer-events", "none");

      const x = d3
        .scaleBand()
        .range([0, innerWidth])
        .domain(dataArray.map((d) => d.genre))
        .padding(0.1);

      const maxCount = d3.max(dataArray, (d) => d.count) || 0;

      const y = d3
        .scaleLinear()
        .range([innerHeight, 0])
        .domain([0, Math.ceil((maxCount + 1) / 25) * 25]);

      g.append("g")
        .attr("transform", `translate(0, ${innerHeight})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end")
        .style("font-size", 12);

      g.append("g")
        .call(d3.axisLeft(y).tickValues(d3.range(0, maxCount + 26, 25)))
        .style("font-size", 12);

      g.selectAll(".bar")
        .data(dataArray)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", (d) => x(d.genre) || 0)
        .attr("y", (d) => y(d.count))
        .attr("width", x.bandwidth())
        .attr("height", (d) => innerHeight - y(d.count))
        .attr("fill", "#4682b4ff")
        .on("mouseover", function (event, d) {
          d3.select(this).attr("fill", "#31597aff");
          tooltip.transition().duration(200).style("opacity", 1);
          tooltip
            .html(`Genre: ${d.genre}<br>Movies: ${d.count}`)
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 28 + "px");
        })
        .on("mousemove", function (event) {
          tooltip
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 28 + "px");
        })
        .on("mouseleave", function () {
          d3.select(this).attr("fill", "#4682b4");
          tooltip.transition().duration(500).style("opacity", 0);
        });

      g.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "middle")
        .attr("y", -GRAPH_PROPERTY.margin.left + 15)
        .attr("x", -innerHeight / 2)
        .attr("transform", "rotate(-90)")
        .style("font-size", 16)
        .style("font-weight", "bold")
        .text("Number of Movies");

      g.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "middle")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight + GRAPH_PROPERTY.margin.bottom - 10)
        .style("font-size", 16)
        .style("font-weight", "bold")
        .text("Genre");
    });

    return () => {
      d3.select("body").select(".tooltip").remove();
    };
  }, []);

  return (
    <div>
      <h3>Popular genre</h3>
      <svg
        ref={ref}
        style={{ width: GRAPH_PROPERTY.width, height: GRAPH_PROPERTY.height }}
      />
    </div>
  );
}
