import React from "react";
import { Table } from "baseui/table";

export default function ({ headers }) {
  return (
    <Table
      columns={["Headers"]}
      data={headers.map((header) => [header.name, header.example])}
    />
  );
}
