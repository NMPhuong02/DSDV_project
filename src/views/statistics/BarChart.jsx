import * as d3 from 'd3'
import React, { useEffect, useRef } from 'react'
import Data from './../../data/data.csv'

const GRAPH_PROPERTY = { width: 1200, height: 2000, margin: 120 }

export default function BarChart() {
  const ref = useRef()
  useEffect(() => {
    d3.csv(Data).then((csvData) => {
      const dataFrom2010 = csvData.filter((item) => item.year >= 2010)
      console.log(dataFrom2010)
      const filmName = []
      const budget = []
      dataFrom2010.forEach((item) => {
        budget.push(parseFloat(item.budget))
        let name = item.name
        if (item.name.length > 15) name = name.slice(0, 15) + '...'
        filmName.push(name)
      })
      console.log(filmName)
      console.log(budget)
      const svgElement = d3.select(ref.current)
      let maxBudget = 0
      csvData.forEach((item) => {
        if (parseFloat(item.year) >= 2010 && parseFloat(item.budget) > maxBudget) {
          maxBudget = parseFloat(item.budget)
        }
      })
      let minBudget = maxBudget
      csvData.forEach((item) => {
        if (parseFloat(item.year) >= 2010 && parseFloat(item.budget) < minBudget) {
          minBudget = parseFloat(item.budget)
        }
      })
      dataFrom2010.forEach((item) => {
        let itemBudget = parseFloat(item.budget)
        if (isNaN(itemBudget)) item.budget = Math.random() * (maxBudget - minBudget) + minBudget
      })
      const xScale = d3
        .scaleLinear()
        .domain([minBudget, maxBudget + 50000000])
        .range([0, GRAPH_PROPERTY.width - GRAPH_PROPERTY.margin])
      const yScale = d3
        .scaleBand()
        .domain(filmName)
        .range([GRAPH_PROPERTY.height - GRAPH_PROPERTY.margin, 0])
        .padding(0.1)
      let maxRating = 0
      csvData.forEach((item) => {
        if (parseFloat(item.year) >= 2010 && parseFloat(item.rating) > maxRating) {
          maxRating = parseFloat(item.rating)
        }
      })
      let minRating = maxRating
      csvData.forEach((item) => {
        if (parseFloat(item.year) >= 2010 && parseFloat(item.rating) < minRating) {
          minRating = parseFloat(item.rating)
        }
      })
      const colorScale = d3.scaleLinear().domain([8, 9]).range(['white', 'blue'])
      const xAxis = d3.axisBottom(xScale).ticks(10)
      const yAxis = d3.axisLeft(yScale).ticks(10)
      d3.select('body')
        .append('div')
        .style('position', 'absolute')
        .style('visibility', 'hidden')
        .style('background-color', 'white')
        .style('border', 'solid')
        .style('border-width', '1px')
        .style('border-radius', '5px')
        .style('padding', '10px')
      svgElement
        .append('g')
        .attr('transform', `translate(90,${GRAPH_PROPERTY.height - GRAPH_PROPERTY.margin})`)
        .call(xAxis)
      svgElement.append('g').attr('transform', `translate(90,10)`).call(yAxis)

      svgElement
        .selectAll('rect')
        .data(dataFrom2010)
        .enter()
        .append('rect')
        .attr('x', xScale(1))
        .attr('y', (d) => {
          let name = d.name
          if (d.name.length > 15) name = name.slice(0, 15) + '...'
          return yScale(name)
        })
        .attr('fill', (d) => colorScale(d.rating))
        .attr('width', (d) => xScale(d.budget))
        .attr('height', '10px')
        .attr('transform', `translate(90,23)`)
        .style('stroke', 'black')
        .style('stroke-width', '1px')

      for (let i = 0; i < dataFrom2010.length; i++) {
        svgElement
          .append('text')
          .attr('x', xScale(dataFrom2010[i].budget) + 10)
          .attr('y', (d) => {
            let name = dataFrom2010[i].name
            if (dataFrom2010[i].name.length > 15) name = name.slice(0, 15) + '...'
            return yScale(name) + 10
          })
          .attr('transform', `translate(90,23)`)
          .text(dataFrom2010[i].budget)
          .style('font-size', '10px')
          .style('font-weight', 'bold')
      }
    })
  }, [])
  return (
    <div>
      <svg ref={ref} width={GRAPH_PROPERTY.width} height={GRAPH_PROPERTY.height}></svg>
    </div>
  )
}
