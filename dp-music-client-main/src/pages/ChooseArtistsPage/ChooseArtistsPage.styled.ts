import styled from "styled-components";

export const ChooseArtistsPageContainerStyled = styled.div`
  width: 100%;
  display: flex;
  margin-top: 50px;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

export const ArtistsContainerStyled = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  width: 60%;
  padding-bottom: 120px;
`;

export const ArtistAvatarStyled = styled.img<{
  $isSelected?: boolean;
  $isDisabled: boolean;
}>`
  width: 160px;
  height: 160px;
  border-radius: 50%;
  margin-right: 20px;
  margin-bottom: 20px;
  cursor: pointer;
  border: 3px solid transparent;
  transition: 0.2s ease-in-out;

  &:hover {
    border: 3px solid #8B5CF6;
  }

  ${({ $isSelected }) =>
    $isSelected &&
    `
        box-shadow: 0px 0px 15px 2px #8B5CF6;
        border: 3px solid #8B5CF6;
    `}

  ${({ $isDisabled }) =>
    $isDisabled &&
    `
        opacity: 0.5;
        cursor: not-allowed;
        border: 3px solid transparent !important;
    `}
`;
