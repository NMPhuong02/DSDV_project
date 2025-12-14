import React from 'react'

const Introduction = React.lazy(() => import('./views/introduction/Introduction'))
const Statistics = React.lazy(() => import('./views/statistics/Statistics'))
const Category = React.lazy(() => import('./views/category/Category'))

const routes = [
  { path: '/', exact: true, name: 'Introduction', element: Introduction },
  { path: '/introduction', name: 'Introduction', element: Introduction },
  { path: '/statistics', name: 'Statistics', element: Statistics },
  { path: '/category', name: 'Category', element: Category },
]

export default routes
