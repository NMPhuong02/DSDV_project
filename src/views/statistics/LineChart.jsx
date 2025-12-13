import * as d3 from 'd3'
import React, { useEffect, useRef } from 'react'
import Data from './../../data/data.csv'

const GRAPH_PROPERTY = { width: 1000, height: 500, margin: 120 }

export default function LineChart() {
  const ref = useRef()
  useEffect(() => {
    d3.csv(Data).then((csvData) => {
      let year = [...new Set(csvData.map((item) => item.year))]
      year = year.sort((a, b) => a - b)
      year = year.filter((item) => item >= 2009)
      // console.log(year)
      const ratingAndYear = csvData.map((item) => [item.rating, item.year])
      const averageRating = {}
      ratingAndYear.forEach((item) => {
        if (averageRating[item[1]] === undefined) {
          averageRating[item[1]] = [item[0]]
        } else {
          averageRating[item[1]].push(item[0])
        }
      })
      const averageRatingArray = {}
      Object.entries(averageRating).forEach((item) => {
        if (item[0] >= 2009) averageRatingArray[item[0]] = d3.mean(item[1])
      })

      Object.entries(averageRatingArray).forEach((item) => {
        item[0] = parseFloat(item[0])
        item[1] = parseFloat(item[1])
      })

      const svgElement = d3.select(ref.current)
      const minYear = Math.min(...year)
      const maxYear = Math.max(...year)
      // console.log(minYear, maxYear)
      const xScale = d3
        .scaleLinear()
        .domain([2009, 2023])
        .range([0, GRAPH_PROPERTY.width - GRAPH_PROPERTY.margin])
      const yScale = d3
        .scaleLinear()
        .domain([8, 8.7])
        .range([GRAPH_PROPERTY.height - GRAPH_PROPERTY.margin, 0])
      const xAxis = d3.axisBottom(xScale).ticks(10)
      const yAxis = d3.axisLeft(yScale).ticks(10)
      svgElement
        .append('g')
        .attr('transform', `translate(90,${GRAPH_PROPERTY.height - GRAPH_PROPERTY.margin + 10})`)
        .call(xAxis)
      svgElement.append('g').attr('transform', `translate(90,10)`).call(yAxis)
      svgElement
        .append('text')
        .attr('transform', `translate(500,450)`)
        .text('Year')
        .style('text-anchor', 'middle')
        .style('font-size', '20px')
        .style('font-weight', 'bold')
      svgElement
        .append('text')
        .attr('transform', `translate(40,200)rotate(-90)`)
        .text('Average Rating')
        .style('text-anchor', 'middle')
        .style('font-size', '20px')
        .style('font-weight', 'bold')
      const line = d3
        .line()
        .x(function (d) {
          return xScale(d[0])
        })
        .y(function (d) {
          return yScale(d[1])
        })
      svgElement
        .append('path')
        .datum(Object.entries(averageRatingArray))
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 1.5)
        .attr('transform', `translate(90,10)`)
        .attr('d', line)
      const bisect = d3.bisector(function (d) {
        return d[0]
      }).left
      const focus = svgElement
        .append('g')
        .append('circle')
        .style('fill', 'none')
        .attr('stroke', 'black')
        .attr('r', 8.5)
        .attr('transform', `translate(90,10)`)
        .style('opacity', 0)
      let tooltip = d3
        .select('body')
        .append('div')
        .style('position', 'absolute')
        .style('visibility', 'hidden')
        .style('background-color', 'white')
        .style('border', 'solid')
        .style('border-width', '1px')
        .style('border-radius', '5px')
        .style('padding', '10px')
      const focusText = svgElement
        .append('g')
        .append('text')
        .style('opacity', 0)
        .attr('text-anchor', 'left')
        .attr('alignment-baseline', 'middle')
      svgElement
        .append('rect')
        .style('fill', 'none')
        .style('pointer-events', 'all')
        .attr('width', GRAPH_PROPERTY.width - GRAPH_PROPERTY.margin)
        .attr('height', GRAPH_PROPERTY.height - GRAPH_PROPERTY.margin)
        .attr('transform', `translate(50)`)
        .on('mouseover', mouseover)
        .on('mousemove', mousemove)
        .on('mouseout', mouseout)
      function mouseover() {
        focus.style('opacity', 1)
        focusText.style('opacity', 1)
      }
      function mousemove(event) {
        const x0 = xScale.invert(d3.pointer(event)[0])

        if (x0 < minYear || x0 > maxYear) {
          return
        }
        // console.log(x0)
        const i = bisect(Object.entries(averageRatingArray), Math.round(x0), 1)
        const selectedData = Object.entries(averageRatingArray)[i]
        focus.attr('cx', xScale(selectedData[0])).attr('cy', yScale(selectedData[1]))
        tooltip
          .html(
            `Year: ${selectedData[0]}<br/>Average Rating: ${parseFloat(selectedData[1]).toFixed(
              2,
            )}`,
          )
          .style('visibility', 'visible')
          .style('top', event.pageY - 10 + 'px')
          .style('left', event.pageX + 10 + 'px')
      }
      function mouseout() {
        focus.style('opacity', 0)
        focusText.style('opacity', 0)
        tooltip.style('visibility', 'hidden')
      }
    })
  }, [])
  return (
    <div>
      <svg ref={ref} width={GRAPH_PROPERTY.width} height={GRAPH_PROPERTY.height}></svg>
    </div>
  )
}
