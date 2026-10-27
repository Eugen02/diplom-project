import styled from "styled-components";
import { colors } from "../../constants/colors";

export const HomePageStyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 50px;
  width: 100%;
  height: 95vh;
  overflow-y: auto;
`;

export const TasteTilesStyledWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin: 20px 0 40px;
`;

export const TasteTileStyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 170px;
  cursor: pointer;
  transition: 0.15s ease-in-out;

  &:hover {
    transform: translateY(-4px);
  }
`;

export const TasteTileCoverStyledWrapper = styled.div<{ $bgUrl?: string }>`
  width: 170px;
  height: 170px;
  border-radius: 8px;
  background: ${({ $bgUrl }) =>
    $bgUrl ? `url(${$bgUrl}) center / cover no-repeat` : colors.darkGray};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
`;

export const TasteTileNameStyledWrapper = styled.p`
  font-size: 15px;
  font-weight: 600;
  text-align: center;
`;

export const SearchInputStyledWrapper = styled.div`
  margin: 10px 0 24px;

  input {
    width: 340px;
    margin: 0;
  }
`;

export const TrackGridStyledWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 100%;
`;

export const EmptyStateStyledWrapper = styled.p`
  color: ${colors.gray};
  margin-top: 10px;
`;
