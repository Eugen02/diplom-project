import styled from "styled-components";
import { colors, primaryAlpha } from "../../../constants/colors";

export const PlaylistItemStyledWrapper = styled.div<{ $isActive?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 8px;
  border-radius: 10px;
  background: ${({ $isActive }) => ($isActive ? primaryAlpha(0.14) : "transparent")};
  transition: background 0.15s ease-in-out;

  img {
    border-radius: 8px;
    object-fit: cover;
    flex-shrink: 0;
  }

  &:hover {
    background: ${({ $isActive }) =>
      $isActive ? primaryAlpha(0.2) : colors.backgroundHoverGray};
  }
`;

export const PlaylistItemDeleteButtonStyled = styled.div`
  margin-left: auto;
  padding: 8px;
  color: ${colors.gray};
  opacity: 0;
  transition: opacity 0.15s ease-in-out, color 0.15s ease-in-out;

  ${PlaylistItemStyledWrapper}:hover & {
    opacity: 1;
  }

  &:hover {
    color: ${colors.danger};
  }
`;

export const PlaylistItemInfoStyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
`;

export const PlaylistItemNameStyledWrapper = styled.p<{ $isActive?: boolean }>`
  margin-bottom: 4px;
  font-size: 15px;
  font-weight: 700;
  text-align: left;
  color: ${({ $isActive }) => ($isActive ? colors.primarySoft : colors.white)};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const PlaylistItemTypeStyledWrapper = styled.p`
  font-size: 12px;
  text-align: left;
  color: ${colors.gray};
`;
