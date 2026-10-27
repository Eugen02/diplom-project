import React, { ReactElement, ReactNode, useState } from "react";
import styled from "styled-components";
import { chartTheme } from "./chartTheme";

const CardStyledWrapper = styled.section`
  background: ${chartTheme.surface};
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 22px 24px;
  font-family: ${chartTheme.fontFamily};
  min-width: 0;
`;

const HeaderStyledWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
`;

const TitleStyled = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: ${chartTheme.inkPrimary};
`;

const SubtitleStyled = styled.p`
  margin: 4px 0 0;
  font-size: 13px;
  color: ${chartTheme.inkMuted};
`;

const ToggleStyledWrapper = styled.div`
  display: flex;
  padding: 2px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
`;

const ToggleButtonStyled = styled.button<{ $isActive: boolean }>`
  border: none;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  color: ${({ $isActive }) =>
    $isActive ? chartTheme.inkPrimary : chartTheme.inkMuted};
  background: ${({ $isActive }) =>
    $isActive ? "rgba(255, 255, 255, 0.12)" : "transparent"};
`;

const LegendStyledWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin: -6px 0 16px;
  font-size: 12px;
  color: ${chartTheme.inkSecondary};

  span {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  i {
    width: 10px;
    height: 10px;
    border-radius: 3px;
  }
`;

export const FormulaStyled = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid ${chartTheme.grid};
  font-size: 12px;
  line-height: 1.5;
  color: ${chartTheme.inkMuted};

  b {
    flex-shrink: 0;
    font-style: italic;
    color: ${chartTheme.inkSecondary};
  }

  code {
    font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
    font-size: 12px;
    color: ${chartTheme.inkSecondary};
  }
`;

export const EmptyChartStyled = styled.div`
  padding: 28px 0;
  text-align: center;
  font-size: 13px;
  color: ${chartTheme.inkMuted};
`;

interface ChartCardProps {
  title: string;
  subtitle?: string;
  legend?: { label: string; color: string }[];
  chart: ReactNode;
  table?: ReactNode;
  // How the plotted values are derived, shown under the chart.
  formula?: ReactNode;
}

export const ChartCard = (props: ChartCardProps): ReactElement => {
  const { title, subtitle, legend, chart, table, formula } = props;
  const [view, setView] = useState<"chart" | "table">("chart");

  return (
    <CardStyledWrapper>
      <HeaderStyledWrapper>
        <div>
          <TitleStyled>{title}</TitleStyled>
          {subtitle && <SubtitleStyled>{subtitle}</SubtitleStyled>}
        </div>

        {table && (
          <ToggleStyledWrapper>
            <ToggleButtonStyled
              $isActive={view === "chart"}
              onClick={() => setView("chart")}
            >
              Графік
            </ToggleButtonStyled>
            <ToggleButtonStyled
              $isActive={view === "table"}
              onClick={() => setView("table")}
            >
              Таблиця
            </ToggleButtonStyled>
          </ToggleStyledWrapper>
        )}
      </HeaderStyledWrapper>

      {legend && view === "chart" && (
        <LegendStyledWrapper>
          {legend.map((item) => (
            <span key={item.label}>
              <i style={{ background: item.color }} />
              {item.label}
            </span>
          ))}
        </LegendStyledWrapper>
      )}

      {view === "chart" || !table ? chart : table}

      {formula && (
        <FormulaStyled>
          <b>ƒ</b>
          <span>{formula}</span>
        </FormulaStyled>
      )}
    </CardStyledWrapper>
  );
};
