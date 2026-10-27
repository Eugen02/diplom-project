import React, { ReactElement } from "react";
import styled from "styled-components";
import { chartTheme, formatPercent } from "./chartTheme";
import {
  SwatchStyled,
  TooltipRowStyled,
  TooltipTitleStyled,
  useChartTooltip,
} from "./ChartTooltip";

const RowStyled = styled.div`
  display: grid;
  grid-template-columns: 150px 1fr 64px;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
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
`;

const TrackStyled = styled.div`
  position: relative;
  height: 18px;
  border-left: 1px solid ${chartTheme.baseline};
  background: linear-gradient(${chartTheme.grid}, ${chartTheme.grid}) center / 100%
    1px no-repeat;
`;

const BandStyled = styled.div`
  position: absolute;
  top: 4px;
  height: 10px;
  border-radius: 5px;
  opacity: 0.35;
`;

const DotStyled = styled.div`
  position: absolute;
  top: 3px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  transform: translateX(-50%);
  box-shadow: 0 0 0 2px ${chartTheme.surface};
`;

const ValueStyled = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: ${chartTheme.inkPrimary};
  text-align: right;
`;

const AxisStyled = styled.div`
  display: grid;
  grid-template-columns: 150px 1fr 64px;
  gap: 12px;
  font-size: 11px;
  color: ${chartTheme.inkMuted};

  div {
    display: flex;
    justify-content: space-between;
  }
`;

interface IntervalRow {
  label: string;
  value: number;
  low: number;
  high: number;
  color: string;
  detail?: string;
}

interface IntervalChartProps {
  rows: IntervalRow[];
  valueLabel: string;
}

// Point estimate + confidence interval per group on one shared ratio axis.
export const IntervalChart = (props: IntervalChartProps): ReactElement => {
  const { rows, valueLabel } = props;
  const { bind, element } = useChartTooltip();

  const rawMax = Math.max(...rows.map((row) => row.high), 0.01);
  const max = Math.ceil(rawMax * 100 * 1.15) / 100;
  const position = (ratio: number) => `${(ratio / max) * 100}%`;
  const asPercent = (ratio: number) =>
    formatPercent(Math.round(ratio * 1000) / 10);

  return (
    <div>
      {rows.map((row) => (
        <RowStyled
          key={row.label}
          {...bind(
            <>
              <TooltipTitleStyled>{row.label}</TooltipTitleStyled>
              <TooltipRowStyled>
                <SwatchStyled $color={row.color} />
                {valueLabel}
                <b>{asPercent(row.value)}</b>
              </TooltipRowStyled>
              <TooltipRowStyled>
                95% ДІ
                <b>
                  {asPercent(row.low)} – {asPercent(row.high)}
                </b>
              </TooltipRowStyled>
              {row.detail && (
                <TooltipRowStyled>
                  {row.detail}
                </TooltipRowStyled>
              )}
            </>
          )}
        >
          <LabelStyled>{row.label}</LabelStyled>
          <TrackStyled>
            <BandStyled
              style={{
                left: position(row.low),
                width: `calc(${position(row.high - row.low)} + 2px)`,
                background: row.color,
              }}
            />
            <DotStyled
              style={{ left: position(row.value), background: row.color }}
            />
          </TrackStyled>
          <ValueStyled>{asPercent(row.value)}</ValueStyled>
        </RowStyled>
      ))}

      <AxisStyled>
        <span />
        <div>
          <span>0%</span>
          <span>{asPercent(max / 2)}</span>
          <span>{asPercent(max)}</span>
        </div>
        <span />
      </AxisStyled>
      {element}
    </div>
  );
};
