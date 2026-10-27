import styled from "styled-components";
import { colors } from "../../../constants/colors";

export const ModalStyledWrapper = styled.div``;

export const ModalBackground = styled.div<{ width: number; height: number }>`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: ${({ width }) => `${width}px`};
  height: ${({ height }) => `${height}px`};
  background-color: ${colors.darkGray};
  border: 1px solid ${colors.border};
  box-shadow: 0 30px 80px -20px rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  border-radius: 18px;
`;

export const ModalContent = styled.div`
  color: ${colors.white};
  padding: 20px;
  border-radius: 10px;
  width: "100%";
`;

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background-color: rgba(8, 8, 12, 0.72);
  backdrop-filter: blur(6px);
  z-index: 100;
`;
