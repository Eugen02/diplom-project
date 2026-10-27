import styled from "styled-components";
import { colors } from "../../constants/colors";

export const PlaylistPageStyledWrapper = styled.div`
  padding: 5px 10px;
  width: 100%;
`;

export const PlaylistPageHeaderStyledWrapper = styled.div`
  height: 300px;
  width: 100%;
  background: ${colors.darkGray};
  padding: 25px;
  border-radius: 4px;
  display: flex;
  align-items: center;
`;

export const PlaylistNameStyledWrapper = styled.p`
  font-size: 64px;
  font-weight: 800;
  margin-bottom: 10px;
`;

export const PlaylistTypeStyledWrapper = styled.p`
  font-size: 18px;
`;
