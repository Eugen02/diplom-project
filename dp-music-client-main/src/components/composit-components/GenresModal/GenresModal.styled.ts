import styled from "styled-components";
import { colors } from "../../../constants/colors";

export const GenresModalCloseButtonStyled = styled.button`
  position: absolute;
  top: 14px;
  right: 14px;
  background: transparent;
  border: none;
  color: ${colors.gray};
  cursor: pointer;
  font-size: 18px;
  padding: 6px;
  display: flex;

  &:hover {
    color: ${colors.white};
  }
`;

export const GenresGridStyled = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  max-height: 320px;
  overflow-y: auto;
  margin: 20px 0;
  padding-right: 6px;
`;

export const GenreOptionStyled = styled.label<{ $isSelected: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid ${colors.darkGray};
  background-color: ${({ $isSelected }) =>
    $isSelected ? colors.backgroundHoverGray : "transparent"};
  text-transform: capitalize;

  &:hover {
    border-color: ${colors.primary};
  }
`;
