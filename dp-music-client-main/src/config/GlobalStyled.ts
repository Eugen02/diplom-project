import { createGlobalStyle } from "styled-components";
import { colors } from "../constants/colors";

export const GlobalStyled = createGlobalStyle`
  body {
    background: ${() => colors.black};
    color: ${() => colors.white};
  }
`;
