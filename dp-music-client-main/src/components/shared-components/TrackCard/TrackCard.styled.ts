import styled from "styled-components";
import { colors } from "../../../constants/colors";

export const PlayIconStyledWrapper = styled.div`
  position: absolute;
  color: ${colors.primary};
  opacity: 0;
  bottom: 90px;
  right: 20px;

  svg {
    width: 74px;
    height: 74px;
  }
`;

export const TrackCardStyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 26px;
  margin-right: 26px;
  background: ${colors.darkGray};
  padding: 16px;
  border-radius: 4px;
  transition: 0.2s ease-in-out;
  max-width: 200px;

  position: relative;

  &:hover ${PlayIconStyledWrapper} {
    opacity: 1;
  }

  &:hover {
    cursor: pointer;
    background: ${colors.gray};
  }
`;

export const TrackNameStyledWrapper = styled.p`
  font-size: 16px;
  text-align: left;
  margin-bottom: 10px;
  font-weight: 600;
`;

export const ArtistNameStyledWrapper = styled.p`
  font-size: 14px;
  text-align: left;
`;

export const TrackInfoStyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;
