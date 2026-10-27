import React from "react";
import styled, { css } from "styled-components";
import { colors, primaryAlpha } from "../../../constants/colors";

// Creating different button variants
const buttonVariants: any = {
  primary: css`
    background: ${colors.brandGradient};
    border-color: transparent;
    color: ${colors.white};
    &:hover {
      box-shadow: 0 6px 20px -6px ${primaryAlpha(0.6)};
      filter: brightness(1.08);
    }
  `,
  secondary: css`
    background-color: ${colors.darkGray};
    border-color: ${colors.border};
    color: ${colors.white};
    &:hover {
      background-color: ${colors.backgroundHoverGray};
    }
  `,
  disabled: css`
    background-color: ${colors.gray};
    color: ${colors.lightGray};
    cursor: not-allowed;
  `,
};

// Creating a styled button element
const StyledButton = styled.button`
  padding: 10px 15px;
  margin: 10px;
  border: 1px solid ${colors.darkGray};
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s, box-shadow 0.2s,
    filter 0.2s;

  // Apply different styles based on the variant prop
  ${(props: any) => buttonVariants[props.variant || "primary"]}

  &:focus {
    outline: none;
  }

  &:disabled {
    ${buttonVariants.disabled}
  }
`;

// Your Button component
const Button = (props: any) => {
  return <StyledButton {...props}>{props.children}</StyledButton>;
};

export default Button;
