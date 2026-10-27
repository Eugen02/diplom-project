import styled, { css } from "styled-components";

interface TitleProps {
  variant?: "primary" | "secondary";
  size?: "small" | "medium" | "large";
}

const getTitleVariantStyles = (variant: "primary" | "secondary") => {
  return null;
};

const getTitleSizeStyles = (size: "small" | "medium" | "large") => {
  if (size === "small") {
    return css`
      font-size: 16px;
    `;
  }
  if (size === "medium") {
    return css`
      font-size: 24px;
    `;
  }
  if (size === "large") {
    return css`
      font-size: 32px;
    `;
  }
  return null;
};

export const Title = styled.h1<TitleProps>`
  font-weight: bold;
  margin: 10px 0;
  ${(props) => getTitleVariantStyles(props.variant || "primary")}
  ${(props) => getTitleSizeStyles(props.size || "medium")}
`;
