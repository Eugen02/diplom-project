import React from "react";
import styled from "styled-components";
import { colors, primaryAlpha } from "../../../constants/colors";

// Creating a styled input element
const StyledInput = styled.input`
  padding: 10px 18px;
  margin: 10px;
  color: ${colors.white};
  background-color: ${colors.deepBlack};
  border: 1px solid ${colors.backgroundHoverGray};
  border-radius: 10px;
  transition: border-color 0.15s, box-shadow 0.15s;

  &::placeholder {
    color: ${colors.gray};
  }

  &:hover {
    border-color: ${colors.gray};
  }

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px ${primaryAlpha(0.25)};
  }
`;

// Your Input component
export const Input = (props: any) => {
  return <StyledInput {...props} />;
};
