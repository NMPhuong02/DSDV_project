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
      const ratings = csvData.map((item) => parseFloat(item.rating));

      if (ratings.length === 0) {
        console.warn("No valid movie ratings found in the dataset.");
        return;
      }

      const x = d3
        .scaleLinear()
        .domain([d3.min(ratings) - 0.05, d3.max(ratings) + 0.05])
        .range([0, innerWidth]);

      const histogram = d3
        .histogram()
        .value((d) => d)
        .domain(x.domain())
        .thresholds(x.ticks(20));

      const bins = histogram(ratings);

      const yMax = d3.max(bins, (d) => d.length) || 0;

      const y = d3
        .scaleLinear()
        .range([innerHeight, 0])
        .domain([0, yMax * 1.1]);

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

      g.append("g")
        .attr("transform", `translate(0, ${innerHeight})`)
        .call(d3.axisBottom(x).ticks(10))
        .style("font-size", 12);

      g.append("g")
        .call(d3.axisLeft(y).ticks(10).tickFormat(d3.format("d")))
        .style("font-size", 12);

      g.selectAll("rect")
        .data(bins)
        .enter()
        .append("rect")
        .attr("x", (d) => x(d.x0) + 1)
        .attr("y", (d) => y(d.length))
        .attr("width", (d) => Math.max(0, x(d.x1) - x(d.x0) - 1))
        .attr("height", (d) => innerHeight - y(d.length))
        .attr("fill", "#4682b4")
        .on("mouseover", function (event, d) {
          d3.select(this).attr("fill", "#31597a");
          tooltip.transition().duration(200).style("opacity", 1);
          tooltip
            .html(
              `Rating: ${d.x0.toFixed(1)}
              <br>Frequency: ${d.length}`
            )
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
        .text("Frequency ");

      g.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "middle")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight + GRAPH_PROPERTY.margin.bottom - 10)
        .style("font-size", 16)
        .style("font-weight", "bold")
        .text("Rating Score");
    });

    return () => {
      d3.select("body").select(".tooltip").remove();
    };
  }, []);

  return (
    <div>
      <h3>Movie Ratings</h3>
      <svg
        ref={ref}
        style={{ width: GRAPH_PROPERTY.width, height: GRAPH_PROPERTY.height }}
      />
    </div>
  );
}
