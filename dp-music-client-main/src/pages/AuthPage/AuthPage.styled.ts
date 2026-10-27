import styled from "styled-components";
import { colors, primaryAlpha } from "../../constants/colors";

export const AuthPageContainerStyled = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: radial-gradient(
      circle at 50% 0%,
      ${primaryAlpha(0.22)},
      transparent 55%
    ),
    ${colors.black};
`;

export const AuthBrandStyled = styled.div`
  margin-bottom: 24px;
  text-align: center;

  h1 {
    margin: 0;
    font-size: 44px;
    font-weight: 800;
    letter-spacing: -0.03em;
    color: ${colors.white};
  }

  h1 span {
    background: ${colors.brandGradient};
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  p {
    margin: 6px 0 0;
    font-size: 15px;
    color: ${colors.gray};
  }
`;

export const AuthPageStyled = styled.div`
  width: 480px;
  max-width: calc(100vw - 32px);
  margin: 0 auto;
  background-color: ${colors.darkGray};
  border: 1px solid ${colors.border};
  box-shadow: 0 30px 80px -30px rgba(0, 0, 0, 0.8);
  padding: 28px;
  border-radius: 20px;
`;
