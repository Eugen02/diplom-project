import React, { ReactElement, ReactNode } from "react";
import styled from "styled-components";
import { chartTheme } from "./chartTheme";

const TileStyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px 18px;
  border-radius: 14px;
  background: ${chartTheme.surface};
  border: 1px solid rgba(255, 255, 255, 0.06);
  font-family: ${chartTheme.fontFamily};
  min-width: 0;
`;

const LabelStyled = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: ${chartTheme.inkMuted};

  svg {
    font-size: 12px;
  }
`;

const ValueStyled = styled.span`
  display: block;
  font-size: 26px;
  font-weight: 700;
  color: ${chartTheme.inkPrimary};
  white-space: nowrap;

  &::first-letter {
    text-transform: uppercase;
  }
  overflow: hidden;
  text-overflow: ellipsis;
`;

const HintStyled = styled.div`
  font-size: 12px;
  color: ${chartTheme.inkSecondary};
`;

const FormulaStyled = styled.code`
  margin-top: 2px;
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 11px;
  color: ${chartTheme.inkMuted};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

interface StatTileProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  hint?: ReactNode;
  formula?: string;
}

export const StatTile = (props: StatTileProps): ReactElement => {
  const { label, value, icon, hint, formula } = props;

  return (
    <TileStyledWrapper>
      <LabelStyled>
        {icon}
        {label}
      </LabelStyled>
      <ValueStyled>{value}</ValueStyled>
      {hint && <HintStyled>{hint}</HintStyled>}
      {formula && <FormulaStyled title={formula}>{formula}</FormulaStyled>}
    </TileStyledWrapper>
  );
};
