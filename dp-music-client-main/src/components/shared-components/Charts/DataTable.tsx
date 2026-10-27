import React, { ReactElement, ReactNode } from "react";
import styled from "styled-components";
import { chartTheme } from "./chartTheme";
import { EmptyChartStyled } from "./ChartCard";

const TableStyled = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  color: ${chartTheme.inkSecondary};

  th {
    text-align: left;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: ${chartTheme.inkMuted};
    padding: 0 8px 8px;
    border-bottom: 1px solid ${chartTheme.baseline};
  }

  td {
    padding: 8px;
    border-bottom: 1px solid ${chartTheme.grid};
  }

  td:first-child {
    color: ${chartTheme.inkPrimary};
    text-transform: capitalize;
  }

  th.num,
  td.num {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  tr:last-child td {
    border-bottom: none;
  }
`;

export interface DataTableColumn<Row> {
  header: string;
  render: (row: Row) => ReactNode;
  numeric?: boolean;
}

interface DataTableProps<Row> {
  columns: DataTableColumn<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string;
}

export const DataTable = <Row,>(props: DataTableProps<Row>): ReactElement => {
  const { columns, rows, rowKey } = props;

  if (!rows.length) {
    return <EmptyChartStyled>Поки немає даних</EmptyChartStyled>;
  }

  return (
    <TableStyled>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.header} className={column.numeric ? "num" : ""}>
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={rowKey(row)}>
            {columns.map((column) => (
              <td key={column.header} className={column.numeric ? "num" : ""}>
                {column.render(row)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </TableStyled>
  );
};
