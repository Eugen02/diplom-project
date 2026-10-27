import React, { ReactElement } from "react";
import styled from "styled-components";
import { chartTheme, formatCompact } from "./chartTheme";
import {
  SwatchStyled,
  TooltipRowStyled,
  TooltipTitleStyled,
  useChartTooltip,
} from "./ChartTooltip";
import { EmptyChartStyled } from "./ChartCard";

const RowStyled = styled.div`
  display: grid;
  grid-template-columns: 110px 1fr;
  align-items: center;
  gap: 12px;
  padding: 5px 0;
  outline: none;
  border-radius: 6px;

  &:hover,
  &:focus-visible {
    background: rgba(255, 255, 255, 0.04);
  }
`;

const LabelStyled = styled.span`
  font-size: 13px;
  color: ${chartTheme.inkSecondary};
  text-transform: capitalize;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TrackStyled = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  border-left: 1px solid ${chartTheme.baseline};
  min-height: 22px;
`;

const BarStyled = styled.div`
  height: 14px;
  min-width: 2px;
  border-radius: 0 4px 4px 0;
  transition: width 0.3s ease;
`;

const ValueStyled = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${chartTheme.inkPrimary};
  white-space: nowrap;
`;

interface BarListProps {
  rows: { label: string; value: number }[];
  valueLabel: string;
  color?: string;
  maxRows?: number;
  formatValue?: (value: number) => string;
}

// Horizontal bars for one series: label left, bar from a shared baseline,
// value at the bar tip. Rows past maxRows fold into "Інше".
export const BarList = (props: BarListProps): ReactElement => {
  const {
    rows,
    valueLabel,
    color = chartTheme.series1,
    maxRows = 8,
    formatValue = formatCompact,
  } = props;
  const { bind, element } = useChartTooltip();

  if (!rows.length) {
    return <EmptyChartStyled>Поки немає даних</EmptyChartStyled>;
  }

  const visibleRows =
    rows.length > maxRows
      ? [
          ...rows.slice(0, maxRows - 1),
          {
            label: "Інше",
            value: rows
              .slice(maxRows - 1)
              .reduce((sum, row) => sum + row.value, 0),
          },
        ]
      : rows;

  const max = Math.max(...visibleRows.map((row) => row.value), 1);
  const total = rows.reduce((sum, row) => sum + row.value, 0);

  return (
    <div>
      {visibleRows.map((row) => {
        const share = total ? Math.round((row.value / total) * 100) : 0;

        return (
          <RowStyled
            key={row.label}
            {...bind(
              <>
                <TooltipTitleStyled>{row.label}</TooltipTitleStyled>
                <TooltipRowStyled>
                  <SwatchStyled $color={color} />
                  {valueLabel}
                  <b>{formatValue(row.value)}</b>
                </TooltipRowStyled>
                <TooltipRowStyled>
                  Частка
                  <b>{share}%</b>
                </TooltipRowStyled>
              </>
            )}
          >
            <LabelStyled title={row.label}>{row.label}</LabelStyled>
            <TrackStyled>
              <BarStyled
                style={{
                  width: `calc(${(row.value / max) * 100}% - 48px)`,
                  background: color,
                }}
              />
              <ValueStyled>{formatValue(row.value)}</ValueStyled>
            </TrackStyled>
          </RowStyled>
        );
      })}
      {element}
    </div>
  );
};
