import React from "react";
import { ModalBackground, ModalContent, ModalOverlay } from "./Modal.styled";
import { ClickOutside } from "../ClickOutside/ClickOutside";

type ModalProps = {
  children: React.ReactNode;
  width?: number;
  height?: number;
  onClose: () => void;
};

const Modal: React.FC<ModalProps> = ({
  children,
  width = 500,
  height = 400,
  onClose,
}) => {
  return (
    <>
      <ClickOutside onClickOutside={onClose}>
        <ModalBackground onClick={onClose} width={width} height={height}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            {children}
          </ModalContent>
        </ModalBackground>
      </ClickOutside>

      <ModalOverlay />
    </>
  );
};

export default Modal;
