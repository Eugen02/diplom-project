import React, { ReactElement, ReactNode } from "react";
import {
  SectionEyebrowStyled,
  SectionHeaderStyled,
  SectionIconStyled,
  SectionPanelStyled,
  SectionSubtitleStyled,
  SectionTitleStyled,
} from "./StatsPage.styled";

export interface StatsSectionMeta {
  id: string;
  label: string;
  // "r, g, b" triplet; decorative section identity, not a data encoding.
  accent: string;
}

interface StatsSectionProps {
  section: StatsSectionMeta;
  index: number;
  icon: ReactNode;
  title: string;
  subtitle: string;
  children: ReactNode;
}

export const StatsSection = (props: StatsSectionProps): ReactElement => {
  const { section, index, icon, title, subtitle, children } = props;

  return (
    <SectionPanelStyled id={section.id} $accent={section.accent}>
      <SectionHeaderStyled>
        <SectionIconStyled $accent={section.accent}>{icon}</SectionIconStyled>
        <div>
          <SectionEyebrowStyled>
            {String(index + 1).padStart(2, "0")} · {section.label}
          </SectionEyebrowStyled>
          <SectionTitleStyled>{title}</SectionTitleStyled>
          <SectionSubtitleStyled>{subtitle}</SectionSubtitleStyled>
        </div>
      </SectionHeaderStyled>

      {children}
    </SectionPanelStyled>
  );
};
