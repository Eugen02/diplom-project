import styled from "styled-components";
import { colors } from "../../../constants/colors";

export const PlayerStyledWrapper = styled.div<{ $isShowPlayer: boolean }>`
  width: 100%;
  height: 100px;
  background: ${colors.deepBlack};
  border-top: 1px solid ${colors.border};
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;

  transition: 0.2s ease-in-out;

  ${({ $isShowPlayer }) =>
    $isShowPlayer
      ? `
    transform: translateY(0);
  `
      : `
    transform: translateY(100%);
  `}
`;

export const TrackInfoStyledWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  width: 300px;
`;
export const TractNameStyledWrapper = styled.p`
  font-size: 16px;
  text-align: left;
  margin-bottom: 10px;
  font-weight: 600;
`;

export const PlayerControlsStyledWrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
`;

export const PlayerActionsStyledWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 18px;
  width: 220px;
`;

export const VolumeControlStyledWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const VolumeSliderStyledWrapper = styled.input<{ $percent: number }>`
  -webkit-appearance: none;
  appearance: none;
  width: 90px;
  height: 4px;
  border-radius: 4px;
  cursor: pointer;
  background: ${({ $percent }) =>
    `linear-gradient(to right, ${colors.primary} ${$percent}%, ${colors.gray} ${$percent}%)`};

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: ${colors.primary};
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 10px;
    height: 10px;
    border: none;
    border-radius: 50%;
    background: ${colors.primary};
    cursor: pointer;
  }
`;

export const ProgressLineStyledWrapper = styled.div<{ passedPercent: number }>`
  width: 600px;
  height: 4px;
  background: ${colors.gray};
  border-radius: 4px;
  position: relative;
  margin: 0 20px;
  cursor: pointer;

  &::after {
    content: "";
    position: absolute;
    width: ${({ passedPercent }) => passedPercent}%;
    height: 4px;
    background: ${colors.primary};
    border-radius: 4px;
  }

  &::before {
    content: "";
    position: absolute;
    width: 10px;
    height: 10px;
    background: ${colors.primary};
    border-radius: 50%;
    top: -3px;
    left: ${({ passedPercent }) => passedPercent}%;
    transform: translateX(-50%);
  }
`;
