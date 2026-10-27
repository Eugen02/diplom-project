import styled from "styled-components";
import { colors, primaryAlpha } from "../../../constants/colors";

export const LeftSidebarStyledWrapper = styled.div`
  width: 15%;
  min-width: 300px;
  height: 100vh;
  overflow-y: auto;
  background: ${colors.deepBlack};
  border-right: 1px solid ${colors.border};
  padding: 26px 16px 120px;
`;

export const BrandStyled = styled.button`
  display: flex;
  align-items: baseline;
  gap: 2px;
  padding: 0 8px;
  margin-bottom: 26px;
  border: none;
  background: none;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: ${colors.white};
  cursor: pointer;

  span {
    background: ${colors.brandGradient};
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
`;

export const ProfileButtonStyled = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px;
  border: 1px solid ${colors.border};
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.03);
  color: ${colors.white};
  text-align: left;
  cursor: pointer;
  transition: 0.15s ease-in-out;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
  }

  > div:last-child {
    min-width: 0;
  }

  strong,
  span {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  strong {
    font-size: 15px;
  }

  span {
    font-size: 12px;
    color: ${colors.gray};
  }
`;

export const SidebarAvatarStyled = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background: ${colors.brandGradient};
  font-size: 17px;
  font-weight: 800;
  text-transform: uppercase;
  color: ${colors.white};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const CreatePlaylistButtonStyled = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  margin: 22px 0 14px;
  padding: 11px 16px;
  border: 1px solid ${primaryAlpha(0.45)};
  border-radius: 12px;
  background: ${primaryAlpha(0.12)};
  color: ${colors.white};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.15s ease-in-out;

  &:hover {
    background: ${primaryAlpha(0.24)};
  }
`;

export const SectionLabelStyled = styled.p`
  margin: 6px 8px 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${colors.gray};
`;

export const LikedSongsStyledWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  padding: 8px;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.15s ease-in-out;

  &:hover {
    background: ${colors.backgroundHoverGray};
  }

  > div:first-child {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    border-radius: 8px;
    background: ${colors.brandGradient};
    color: ${colors.white};
  }

  strong {
    display: block;
    font-size: 15px;
    color: ${colors.white};
  }

  span {
    font-size: 12px;
    color: ${colors.gray};
  }
`;
