import styled from "styled-components";
import { chartTheme } from "../../components/shared-components/Charts/chartTheme";
import { colors } from "../../constants/colors";

// The scroll container spans the full content area so its scrollbar sits at the
// window edge; the inner column is what's width-capped.
export const StatsPageStyledWrapper = styled.div`
  width: 100%;
  height: 95vh;
  overflow-y: auto;
  font-family: ${chartTheme.fontFamily};
  scroll-behavior: smooth;
`;

export const StatsContentStyled = styled.div`
  max-width: 1280px;
  padding: 40px 60px 140px;
`;

export const BackLinkStyled = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  padding: 0;
  margin-bottom: 18px;
  border: none;
  background: none;
  color: ${chartTheme.inkMuted};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    color: ${chartTheme.inkPrimary};
  }
`;

export const PageHeaderStyled = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  padding: 30px 32px;
  margin-bottom: 18px;
  background: ${colors.brandGradient};

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.35) 100%);
    pointer-events: none;
  }

  h1,
  p {
    position: relative;
    z-index: 1;
    margin: 0;
    color: #ffffff;
  }

  h1 {
    font-size: 34px;
    font-weight: 800;
  }

  p {
    margin-top: 6px;
    font-size: 14px;
    opacity: 0.85;
  }
`;

export const SectionNavStyled = styled.nav`
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 0;
  margin-bottom: 18px;
  background: rgba(18, 18, 25, 0.88);
  backdrop-filter: blur(8px);
`;

export const SectionNavButtonStyled = styled.button<{ $accent: string }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
  color: ${chartTheme.inkSecondary};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.15s ease-in-out;

  i {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgb(${({ $accent }) => $accent});
  }

  &:hover {
    color: ${chartTheme.inkPrimary};
    border-color: rgba(${({ $accent }) => $accent}, 0.6);
    background: rgba(${({ $accent }) => $accent}, 0.12);
  }
`;

// $accent is an "r, g, b" triplet so it can be reused at different alphas.
export const SectionPanelStyled = styled.section<{ $accent: string }>`
  position: relative;
  margin-bottom: 28px;
  padding: 28px;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: linear-gradient(
      180deg,
      rgba(${({ $accent }) => $accent}, 0.1) 0%,
      rgba(${({ $accent }) => $accent}, 0.02) 220px,
      rgba(255, 255, 255, 0.015) 100%
    ),
    #16161D;
  scroll-margin-top: 70px;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 28px;
    right: 28px;
    height: 3px;
    border-radius: 0 0 3px 3px;
    background: rgb(${({ $accent }) => $accent});
  }
`;

export const SectionHeaderStyled = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
`;

export const SectionIconStyled = styled.div<{ $accent: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: rgba(${({ $accent }) => $accent}, 0.18);
  color: rgb(${({ $accent }) => $accent});
  font-size: 20px;
`;

export const SectionEyebrowStyled = styled.span`
  display: block;
  margin-bottom: 2px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${chartTheme.inkMuted};
`;

export const SectionTitleStyled = styled.h2`
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: ${chartTheme.inkPrimary};
`;

export const SectionSubtitleStyled = styled.p`
  margin: 4px 0 0;
  font-size: 13px;
  line-height: 1.5;
  color: ${chartTheme.inkMuted};
`;

export const InsightStyled = styled.div<{ $accent: string }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 18px;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid rgba(${({ $accent }) => $accent}, 0.35);
  background: rgba(${({ $accent }) => $accent}, 0.1);
  font-size: 14px;
  line-height: 1.5;
  color: ${chartTheme.inkPrimary};

  svg {
    flex-shrink: 0;
    margin-top: 3px;
    color: rgb(${({ $accent }) => $accent});
  }

  b {
    font-weight: 700;
  }
`;

export const CaveatStyled = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 4px;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px dashed rgba(255, 255, 255, 0.14);
  font-size: 12.5px;
  line-height: 1.5;
  color: ${chartTheme.inkSecondary};

  svg {
    flex-shrink: 0;
    margin-top: 2px;
    color: ${chartTheme.inkMuted};
  }
`;

export const MetaRowStyled = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;

  span {
    padding: 4px 10px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.06);
    font-size: 12px;
    color: ${chartTheme.inkSecondary};
  }

  b {
    color: ${chartTheme.inkPrimary};
  }
`;

export const TilesGridStyled = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
  margin-bottom: 16px;
`;

export const ChartsGridStyled = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 16px;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const ProgressTrackStyled = styled.div`
  height: 8px;
  margin-top: 6px;
  border-radius: 4px;
  background: rgba(25, 158, 112, 0.2);
  overflow: hidden;

  div {
    height: 100%;
    border-radius: 4px;
    background: #199e70;
  }
`;

export const NoteStyled = styled.p`
  margin: 4px 0 0;
  font-size: 12px;
  color: ${chartTheme.inkMuted};
`;

export const MethodologySubheadingStyled = styled.h3`
  margin: 28px 0 4px;
  font-size: 16px;
  font-weight: 800;
  color: ${chartTheme.inkPrimary};
`;

export const MethodologyListStyled = styled.dl`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 14px;
  margin: 14px 0 0;
`;

export const MethodologyItemStyled = styled.div`
  padding: 16px 18px;
  border-radius: 14px;
  background: ${chartTheme.surface};
  border: 1px solid rgba(255, 255, 255, 0.06);

  dt {
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 700;
    color: ${chartTheme.inkPrimary};
  }

  dd {
    margin: 0;
    font-size: 13px;
    line-height: 1.55;
    color: ${chartTheme.inkSecondary};
  }

  code {
    display: block;
    margin-bottom: 8px;
    padding: 8px 10px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
    font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
    font-size: 12.5px;
    color: ${chartTheme.inkPrimary};
    white-space: pre-wrap;
  }
`;

export const StatusMessageStyled = styled.div`
  padding: 40px 0;
  text-align: center;
  font-size: 14px;
  color: ${chartTheme.inkMuted};
`;
