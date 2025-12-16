import * as d3 from "d3";
import React, { useEffect, useState } from "react";
import Data from "./../../data/data.csv";

import { CTable } from "@coreui/react";

const CategoryTable = () => {
  const [items, setItems] = useState([]);

  const columns = [
    {
      key: "rank",
      label: "Rank",
      _props: { scope: "col" },
    },
    {
      key: "name",
      label: "Name",
      _props: { scope: "col" },
    },
    {
      key: "year",
      label: "Year",
      _props: { scope: "col" },
    },
    {
      key: "rating",
      label: "Rating",
      _props: { scope: "col" },
    },
    {
      key: "budget",
      label: "Budget",
      _props: { scope: "col" },
    },
    {
      key: "box_office",
      label: "Box Office",
      _props: { scope: "col" },
    },
    {
      key: "genre",
      label: "Genre",
      _props: { scope: "col" },
    },
  ];

  useEffect(() => {
    d3.csv(Data).then((data) => {
      const formattedData = data.map((d) => ({
        rank: +d.rank,
        name: d.name,
        year: +d.year,
        rating: +d.rating,
        genre: d.genre,
        budget: +d.budget,
        box_office: +d.box_office,
        _cellProps: { id: { scope: "row" } },
      }));
      setItems(formattedData);
    });
  }, []);

  return (
    <div>
      <CTable columns={columns} items={items} />
    </div>
  );
};

export default CategoryTable;
