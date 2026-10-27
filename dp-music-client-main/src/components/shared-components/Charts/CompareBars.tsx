import React, { ReactElement } from "react";
import styled from "styled-components";
import { chartTheme, formatPercent } from "./chartTheme";
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
  padding: 6px 0;
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

const BarsStyled = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  border-left: 1px solid ${chartTheme.baseline};
`;

const BarLineStyled = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  height: 12px;
`;

const BarStyled = styled.div`
  height: 12px;
  min-width: 2px;
  border-radius: 0 4px 4px 0;
  transition: width 0.3s ease;
`;

const ValueStyled = styled.span`
  font-size: 11px;
  color: ${chartTheme.inkSecondary};
  font-variant-numeric: tabular-nums;
`;

export interface CompareSeries {
  label: string;
  color: string;
}

interface CompareBarsProps {
  rows: { label: string; values: [number, number] }[];
  series: [CompareSeries, CompareSeries];
}

// Two series on one shared percentage axis (each is a share of its own total),
// so they compare directly without a second scale.
export const CompareBars = (props: CompareBarsProps): ReactElement => {
  const { rows, series } = props;
  const { bind, element } = useChartTooltip();

  if (!rows.length) {
    return <EmptyChartStyled>Поки немає даних</EmptyChartStyled>;
  }

  const max = Math.max(...rows.flatMap((row) => row.values), 1);

  return (
    <div>
      {rows.map((row) => (
        <RowStyled
          key={row.label}
          {...bind(
            <>
              <TooltipTitleStyled>{row.label}</TooltipTitleStyled>
              {series.map((item, index) => (
                <TooltipRowStyled key={item.label}>
                  <SwatchStyled $color={item.color} />
                  {item.label}
                  <b>{formatPercent(row.values[index])}</b>
                </TooltipRowStyled>
              ))}
            </>
          )}
        >
          <LabelStyled title={row.label}>{row.label}</LabelStyled>
          <BarsStyled>
            {series.map((item, index) => (
              <BarLineStyled key={item.label}>
                <BarStyled
                  style={{
                    width: `calc(${(row.values[index] / max) * 100}% - 44px)`,
                    background: item.color,
                  }}
                />
                <ValueStyled>{formatPercent(row.values[index])}</ValueStyled>
              </BarLineStyled>
            ))}
          </BarsStyled>
        </RowStyled>
      ))}
      {element}
    </div>
  );
};
