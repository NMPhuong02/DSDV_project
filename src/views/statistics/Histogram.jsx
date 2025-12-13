import * as d3 from 'd3'
import React, { useEffect, useRef } from 'react'
import Data from './../../data/data.csv'

const GRAPH_PROPERTY = {
  width: 1000,
  height: 500,
  margin: 120,
  barColor: 'steelblue',
}

export default function Histogram() {
  const ref = useRef()

  useEffect(() => {
    d3.select(ref.current).selectAll('*').remove()

    d3.csv(Data).then((csvData) => {
      const ratings = csvData
        .map((item) => parseFloat(item.rating))
        .filter((rating) => !isNaN(rating))

      if (ratings.length === 0) {
        console.error('No valid rating data found.')
        return
      }

      const innerWidth = GRAPH_PROPERTY.width - GRAPH_PROPERTY.margin
      const innerHeight = GRAPH_PROPERTY.height - GRAPH_PROPERTY.margin
      const translateX = GRAPH_PROPERTY.margin / 2 + 40
      const translateY = GRAPH_PROPERTY.margin / 2 - 50

      const minRating = d3.min(ratings)
      const maxRating = d3.max(ratings)
      const xScale = d3
        .scaleLinear()
        .domain([minRating, maxRating + 0.1])
        .range([0, innerWidth])
      const numBins = 20
      const histogram = d3
        .histogram()
        .value((d) => d)
        .domain(xScale.domain())
        .thresholds(xScale.ticks(numBins))

      const bins = histogram(ratings)

      const maxCount = d3.max(bins, (d) => d.length)
      const yScale = d3.scaleLinear().domain([0, maxCount]).range([innerHeight, 0])
      const svgElement = d3.select(ref.current)

      const g = svgElement.append('g').attr('transform', `translate(${translateX},${translateY})`)
      const xAxis = d3.axisBottom(xScale).ticks(10)
      g.append('g').attr('transform', `translate(0,${innerHeight})`).call(xAxis)

      const yAxis = d3.axisLeft(yScale).ticks(10)
      g.append('g').call(yAxis)

      g.selectAll('rect')
        .data(bins)
        .enter()
        .append('rect')
        .attr('x', (d) => xScale(d.x0) + 1)
        .attr('width', (d) => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1))
        .attr('y', (d) => yScale(d.length))
        .attr('height', (d) => innerHeight - yScale(d.length))
        .attr('fill', GRAPH_PROPERTY.barColor)
        .on('mouseover', function (event, d) {
          d3.select(this).attr('fill', 'orange')
          d3.select('#tooltip')
            .style('opacity', 1)
            .html(`Rating Range: ${d.x0.toFixed(2)} - ${d.x1.toFixed(2)}<br/>Count: ${d.length}`)
            .style('left', event.pageX + 10 + 'px')
            .style('top', event.pageY - 10 + 'px')
        })
        .on('mouseout', function () {
          d3.select(this).attr('fill', GRAPH_PROPERTY.barColor)
          d3.select('#tooltip').style('opacity', 0)
        })

      svgElement
        .append('text')
        .attr(
          'transform',
          `translate(${innerWidth / 2 + translateX},${GRAPH_PROPERTY.height - 30})`,
        )
        .text('Average User Rating')
        .style('text-anchor', 'middle')
        .style('font-size', '20px')
        .style('font-weight', 'bold')

      svgElement
        .append('text')
        .attr('transform', `translate(20,${innerHeight / 2 + translateY})rotate(-90)`)
        .text('Count')
        .style('text-anchor', 'middle')
        .style('font-size', '20px')
        .style('font-weight', 'bold')
    })
  }, [])

  useEffect(() => {
    if (d3.select('#tooltip').empty()) {
      d3.select('body')
        .append('div')
        .attr('id', 'tooltip')
        .style('position', 'absolute')
        .style('opacity', 0)
        .style('background-color', 'white')
        .style('border', 'solid')
        .style('border-width', '1px')
        .style('border-radius', '5px')
        .style('padding', '10px')
        .style('pointer-events', 'none')
    }
  }, [])

  return (
    <div>
      <svg ref={ref} width={GRAPH_PROPERTY.width} height={GRAPH_PROPERTY.height}></svg>
    </div>
  )
}
