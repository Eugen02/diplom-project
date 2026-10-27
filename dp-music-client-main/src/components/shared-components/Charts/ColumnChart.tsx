import React, { ReactElement } from "react";
import styled from "styled-components";
import { chartTheme, formatCompact, niceMax } from "./chartTheme";
import {
  SwatchStyled,
  TooltipRowStyled,
  TooltipTitleStyled,
  useChartTooltip,
} from "./ChartTooltip";

const PLOT_HEIGHT = 160;

const ChartStyledWrapper = styled.div`
  display: grid;
  grid-template-columns: 28px 1fr;
  column-gap: 8px;
`;

const YAxisStyled = styled.div`
  position: relative;
  height: ${PLOT_HEIGHT}px;
  font-size: 11px;
  color: ${chartTheme.inkMuted};
  font-variant-numeric: tabular-nums;

  span {
    position: absolute;
    right: 0;
    transform: translateY(-50%);
  }
`;

const PlotStyled = styled.div`
  position: relative;
  height: ${PLOT_HEIGHT}px;
  display: flex;
  align-items: flex-end;
  border-bottom: 1px solid ${chartTheme.baseline};
`;

const GridLineStyled = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: ${chartTheme.grid};
`;

const SlotStyled = styled.div`
  position: relative;
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  outline: none;
  border-radius: 6px 6px 0 0;

  &:hover,
  &:focus-visible {
    background: rgba(255, 255, 255, 0.04);
  }
`;

const ColumnStyled = styled.div`
  width: min(60%, 24px);
  border-radius: 4px 4px 0 0;
  transition: height 0.3s ease;
`;

const PeakLabelStyled = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: ${chartTheme.inkPrimary};
  margin-bottom: 4px;
`;

const XAxisStyled = styled.div`
  display: flex;
  margin-top: 6px;
  font-size: 11px;
  color: ${chartTheme.inkMuted};

  span {
    flex: 1;
    text-align: center;
    white-space: nowrap;
  }
`;

interface ColumnChartProps {
  points: { label: string; tooltipLabel: string; value: number }[];
  valueLabel: string;
  color?: string;
  // Show every nth x-axis label so dates don't collide.
  labelEvery?: number;
}

export const ColumnChart = (props: ColumnChartProps): ReactElement => {
  const { points, valueLabel, color = chartTheme.series1, labelEvery = 2 } = props;
  const { bind, element } = useChartTooltip();

  const max = niceMax(Math.max(...points.map((point) => point.value), 0));
  const ticks = [0, max / 2, max];
  const peakValue = Math.max(...points.map((point) => point.value), 0);
  const peakIndex = points.findIndex((point) => point.value === peakValue);

  return (
    <ChartStyledWrapper>
      <YAxisStyled>
        {ticks.map((tick) => (
          <span key={tick} style={{ top: `${100 - (tick / max) * 100}%` }}>
            {formatCompact(tick)}
          </span>
        ))}
      </YAxisStyled>

      <div>
        <PlotStyled>
          {ticks.slice(1).map((tick) => (
            <GridLineStyled
              key={tick}
              style={{ top: `${100 - (tick / max) * 100}%` }}
            />
          ))}

          {points.map((point, index) => (
            <SlotStyled
              key={point.label + index}
              {...bind(
                <>
                  <TooltipTitleStyled>{point.tooltipLabel}</TooltipTitleStyled>
                  <TooltipRowStyled>
                    <SwatchStyled $color={color} />
                    {valueLabel}
                    <b>{formatCompact(point.value)}</b>
                  </TooltipRowStyled>
                </>
              )}
            >
              {index === peakIndex && peakValue > 0 && (
                <PeakLabelStyled>{formatCompact(peakValue)}</PeakLabelStyled>
              )}
              <ColumnStyled
                style={{
                  height: `${(point.value / max) * 100}%`,
                  background: color,
                }}
              />
            </SlotStyled>
          ))}
        </PlotStyled>

        <XAxisStyled>
          {points.map((point, index) => (
            <span key={point.label + index}>
              {index % labelEvery === 0 ? point.label : ""}
            </span>
          ))}
        </XAxisStyled>
      </div>
      {element}
    </ChartStyledWrapper>
  );
};
