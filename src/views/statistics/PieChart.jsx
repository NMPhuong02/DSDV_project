import * as d3 from 'd3'
import { useEffect, useRef } from 'react'
import Data from './../../data/data.csv'
import styles from '../../assets/css/styles.module.css'

const GRAPH_PROPERTY = { width: 600, height: 600, margin: 20 }

export default function PieChart() {
  const ref = useRef()

  useEffect(() => {
    d3.csv(Data).then((csvData) => {
      const allGenres = csvData
        .filter((item) => item.year === '2021')
        .map((item) => item.genre.split(','))
        .flat()

      let data = {}
      allGenres.forEach((item) => {
        if (data[item] === undefined) {
          data[item] = 1
        } else {
          data[item] = data[item] + 1
        }
      })
      console.log(data)

      const svgElement = d3.select(ref.current)

      var radius = Math.min(GRAPH_PROPERTY.width, GRAPH_PROPERTY.height) / 2 - GRAPH_PROPERTY.margin

      const color = d3.scaleOrdinal().range(['#98abc5', '#8a89a6', '#7b6888', '#6b486b', '#a05d56'])

      const pie = d3.pie().value(function (d) {
        return d[1]
      })
      const data_ready = pie(Object.entries(data).filter((_, _index) => _index >= 0))
      var arcGenerator = d3.arc().innerRadius(0).outerRadius(radius)
      svgElement
        .append('g')
        .attr('transform', `translate(${GRAPH_PROPERTY.width / 2}, ${GRAPH_PROPERTY.height / 2})`)
        .selectAll('whatever')
        .data(data_ready)
        .join('path')
        .attr('d', arcGenerator)
        .attr('fill', function (d) {
          return color(d.data[1])
        })
        .attr('stroke', 'black')
        .style('stroke-width', '2px')
        .style('opacity', 0.7)

      svgElement
        .append('g')
        .attr('transform', `translate(${GRAPH_PROPERTY.width / 2}, ${GRAPH_PROPERTY.height / 2})`)
        .selectAll('whatever')
        .data(data_ready)
        .enter()
        .append('text')
        .text(function (d) {
          return d.data[0]
        })
        .attr('transform', function (d) {
          console.log(arcGenerator.centroid(d))
          return 'translate(' + arcGenerator.centroid(d) + ')'
        })
        .style('text-anchor', 'middle')
        .style('font-size', 30)
        .attr('font-weight', 300)
    })
  }, [])
  return (
    <div>
      <h4 className={styles.text}>Movie Theme of 2021</h4>
      <svg ref={ref} style={{ width: GRAPH_PROPERTY.width, height: GRAPH_PROPERTY.height }} />
    </div>
  )
}
