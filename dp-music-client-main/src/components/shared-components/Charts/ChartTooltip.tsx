import React, { ReactElement, ReactNode, useCallback, useState } from "react";
import styled from "styled-components";
import { chartTheme } from "./chartTheme";

const TooltipStyledWrapper = styled.div`
  position: fixed;
  z-index: 1000;
  pointer-events: none;
  min-width: 120px;
  padding: 8px 10px;
  border-radius: 8px;
  background: #0D0D12;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
  color: ${chartTheme.inkPrimary};
  font-family: ${chartTheme.fontFamily};
  font-size: 12px;
  line-height: 1.5;
  transform: translate(12px, -50%);
`;

export const TooltipTitleStyled = styled.div`
  font-weight: 700;
  margin-bottom: 2px;
  text-transform: capitalize;
`;

export const TooltipRowStyled = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${chartTheme.inkSecondary};

  b {
    margin-left: auto;
    padding-left: 12px;
    color: ${chartTheme.inkPrimary};
    font-variant-numeric: tabular-nums;
  }
`;

export const SwatchStyled = styled.span<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 2px;
  background: ${({ $color }) => $color};
  flex-shrink: 0;
`;

interface TooltipState {
  x: number;
  y: number;
  content: ReactNode;
}

// Hover + keyboard-focus tooltip shared by every chart: returns props to spread on
// a mark's hit area and the floating element to render once per chart.
export const useChartTooltip = () => {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const bind = useCallback(
    (content: ReactNode) => ({
      tabIndex: 0,
      onMouseMove: (event: React.MouseEvent) =>
        setTooltip({ x: event.clientX, y: event.clientY, content }),
      onMouseLeave: () => setTooltip(null),
      onFocus: (event: React.FocusEvent<HTMLElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();

        setTooltip({ x: rect.right, y: rect.top + rect.height / 2, content });
      },
      onBlur: () => setTooltip(null),
    }),
    []
  );

  const element: ReactElement | null = tooltip ? (
    <TooltipStyledWrapper style={{ left: tooltip.x, top: tooltip.y }}>
      {tooltip.content}
    </TooltipStyledWrapper>
  ) : null;

  return { bind, element };
};
