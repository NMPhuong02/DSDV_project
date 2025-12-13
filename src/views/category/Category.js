import * as d3 from 'd3'
import React, { useEffect, useState } from 'react'
import Data from './../../data/data.csv'

import { CTable } from '@coreui/react'

const CategoryTable = () => {
  const [items, setItems] = useState([])

  const options = [
    { label: 'Rating', value: 'rating' },
    { label: 'Year', value: 'year' },
    { label: 'Name', value: 'name' },
    'Genre',
  ]

  options.sort((a, b) => {
    const valA = typeof a === 'string' ? a : a.label
    const valB = typeof b === 'string' ? b : b.label
    return valA.localeCompare(valB)
  })

  const columns = [
    {
      key: 'id',
      label: 'ID',
      _props: { scope: 'col' },
    },
    {
      key: 'name',
      label: 'Name',
      _props: { scope: 'col' },
    },
    {
      key: 'year',
      label: 'Year',
      _props: { scope: 'col' },
    },
    {
      key: 'rating',
      label: 'Rating',
      _props: { scope: 'col' },
    },
    {
      key: 'genre',
      label: 'Genre',
      _props: { scope: 'col' },
    },
  ]

  useEffect(() => {
    d3.csv(Data).then((data) => {
      const formattedData = data.map((d, index) => ({
        id: index + 1,
        name: d.name,
        year: +d.year,
        rating: +d.rating,
        genre: d.genre,
        _cellProps: { id: { scope: 'row' } },
      }))
      setItems(formattedData)
    })
  }, [])

  return (
    <div>
      <span>Filter by: </span>
      <select aria-label="Default select example Category">
        {options.map((option, index) => (
          <option key={index} value={typeof option === 'string' ? option : option.value}>
            {typeof option === 'string' ? option : option.label}
          </option>
        ))}
      </select>
      <br></br>
      <CTable columns={columns} items={items} />
    </div>
  )
}

export default CategoryTable
