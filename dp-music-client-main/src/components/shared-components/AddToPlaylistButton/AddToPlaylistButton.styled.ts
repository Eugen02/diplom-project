import styled from "styled-components";
import { colors } from "../../../constants/colors";

export const AddToPlaylistStyledWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export const AddToPlaylistToggleStyled = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;

  &:hover {
    color: ${colors.primary};
  }
`;

export const PlaylistsListStyledWrapper = styled.div`
  position: absolute;
  bottom: calc(100% + 10px);
  right: 0;
  background-color: ${colors.darkGray};
  padding: 10px;
  border-radius: 4px;
  min-width: 160px;
  max-height: 260px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
`;

export const PlaylistOptionStyled = styled.div<{ $isDisabled?: boolean }>`
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;

  ${({ $isDisabled }) =>
    $isDisabled
      ? `
    color: ${colors.gray};
    cursor: default;
  `
      : `
    cursor: pointer;

    &:hover {
      color: ${colors.primary};
      background-color: ${colors.backgroundHoverGray};
    }
  `}
`;
