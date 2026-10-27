import styled from "styled-components";
import { colors, primaryAlpha } from "../../constants/colors";

export const PlaylistPageStyledWrapper = styled.div`
  padding: 5px 10px;
  width: 100%;
`;

export const PlaylistPageHeaderStyledWrapper = styled.div`
  position: relative;
  min-height: 260px;
  width: 100%;
  overflow: hidden;
  background: ${colors.brandGradient};
  padding: 32px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  box-shadow: 0 20px 40px -20px ${primaryAlpha(0.35)};

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(
      circle at 15% 20%,
      rgba(255, 255, 255, 0.18),
      transparent 45%
    );
    pointer-events: none;
  }

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0.35) 100%
    );
    pointer-events: none;
  }
`;

export const PlaylistCoverStyledWrapper = styled.div`
  position: relative;
  z-index: 1;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 16px 32px -12px rgba(0, 0, 0, 0.6);
  flex-shrink: 0;
`;

export const PlaylistInfoStyledWrapper = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  margin-left: 30px;
`;

export const PlaylistNameStyledWrapper = styled.p`
  font-size: 56px;
  font-weight: 800;
  color: ${colors.white};
  line-height: 1.1;
  margin-bottom: 10px;
`;

export const PlaylistMetaRowStyledWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 600;
`;

export const PlaylistTypeStyledWrapper = styled.span`
  font-size: 14px;
`;

export const PlaylistMetaDotStyledWrapper = styled.span`
  opacity: 0.6;
`;

export const PlaylistGenresSectionStyledWrapper = styled.div`
  margin-top: 18px;
`;

export const PlaylistGenresLabelStyledWrapper = styled.p`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;

  svg {
    font-size: 11px;
  }
`;

export const PlaylistGenresRowStyledWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const PlaylistGenreChipStyledWrapper = styled.span`
  padding: 6px 14px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.28);
  text-transform: capitalize;
  font-size: 13px;
  font-weight: 600;
  color: ${colors.white};
`;

export const DeletePlaylistButtonStyledWrapper = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  margin-top: 22px;
  padding: 9px 16px;
  border-radius: 10px;
  border: 1px solid rgba(255, 90, 90, 0.5);
  background: rgba(255, 90, 90, 0.12);
  color: #ffb3b3;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.15s ease-in-out;

  &:hover {
    background: rgba(255, 90, 90, 0.25);
    color: ${colors.white};
  }
`;
