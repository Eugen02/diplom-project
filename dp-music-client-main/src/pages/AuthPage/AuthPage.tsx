import React, { ReactElement } from "react";
import { authApi } from "../../api/auth.api";
import { useAuthForm } from "../../hooks/useAuthForm";
import {
  AuthBrandStyled,
  AuthPageContainerStyled,
  AuthPageStyled,
} from "./AuthPage.styled";
import { Input } from "../../components/shared-components/Input/Input";
import Button from "../../components/shared-components/Button/Button";
import { Title } from "../../components/shared-components/Title/Title";
import { colors } from "../../constants/colors";
import { useNavigate } from "react-router-dom";
import { UserInterface } from "../../types/interfaces/User.interface";
import { userApi } from "../../api/user.api";
import { localStorageUtils } from "../../utils/LocalStorage";
import { useUserStore } from "../../hooks/useUserStore";

const inputStyles = {
  width: "90%",
  margin: "0 auto",
  marginBottom: "10px",
};

const AuthForm = () => {
  const {
    login,
    name,
    age,
    password,
    onChangeAge,
    onChangeName,
    onChangeLogin,
    onChangePassword,
  } = useAuthForm();
  const navigate = useNavigate();
  const { setCurrentUser } = useUserStore();

  const handleSubmit = async () => {
    const { token, refreshToken, expiresIn, refreshTokenExpiresIn, user } =
      await authApi.signUp({
        login,
        name,
        age,
        password,
      });

    if (!token || !user) {
      return;
    }

    setCurrentUser(user);

    localStorageUtils.setAllAuthUserInfo({
      token,
      refreshToken,
      expiresIn,
      refreshTokenExpiresIn,
    });

    navigate("/", { state: { justSignedUp: true } });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        margin: "5px 0 30px",
      }}
    >
      <Title
        style={{
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        Sign{" "}
        <span
          style={{
            color: colors.primary,
          }}
        >
          up
        </span>
      </Title>
      <Title
        style={{
          fontSize: "18px",
          margin: "10px auto",
          marginBottom: 24,
        }}
      >
        Create{" "}
        <span
          style={{
            color: colors.primary,
            fontWeight: "800",
          }}
        >
          your
        </span>{" "}
        account{" "}
      </Title>

      <Input
        type="text"
        value={login}
        placeholder="Login"
        onChange={onChangeLogin}
        style={inputStyles}
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={onChangePassword}
        style={inputStyles}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <Input
          type="text"
          value={name}
          placeholder="Name"
          onChange={onChangeName}
          style={{ ...inputStyles, width: "40%" }}
        />
        <Input
          type="text"
          value={age}
          placeholder="Age"
          onChange={onChangeAge}
          style={{ ...inputStyles, width: "40%" }}
        />
      </div>

      <Button
        style={{
          margin: "0 auto",
          width: "90%",
          marginTop: "20px",
          fontWeight: "600",
        }}
        size="small"
        onClick={handleSubmit}
      >
        Confirm
      </Button>
    </div>
  );
};

const AuthFormSignIn = () => {
  const { login, password, onChangeLogin, onChangePassword } = useAuthForm();
  const navigate = useNavigate();
  const { setCurrentUser } = useUserStore();

  const handleSubmitSignin = async () => {
    const { token, refreshToken, expiresIn, refreshTokenExpiresIn, user } =
      await authApi.signIn(login, password);

    if (!token || !user) {
      return;
    }

    setCurrentUser(user);

    localStorageUtils.setAllAuthUserInfo({
      token,
      refreshToken,
      expiresIn,
      refreshTokenExpiresIn,
    });

    navigate("/");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        margin: "5px 0 30px",
      }}
    >
      <Title
        style={{
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        Sign{" "}
        <span
          style={{
            color: colors.primary,
          }}
        >
          in
        </span>
      </Title>
      <Title
        style={{
          fontSize: "18px",
          margin: "10px auto",
          marginBottom: 24,
        }}
      >
        Welcome back{" "}
      </Title>

      <Input
        type="text"
        value={login}
        placeholder="Login"
        onChange={onChangeLogin}
        style={inputStyles}
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={onChangePassword}
        style={inputStyles}
      />

      <Button
        style={{
          margin: "0 auto",
          width: "90%",
          marginTop: "20px",
          fontWeight: "600",
        }}
        size="small"
        onClick={handleSubmitSignin}
      >
        Confirm
      </Button>
    </div>
  );
};

export enum AuthTypeEnum {
  SIGN_UP = "SIGN_UP",
  SIGN_IN = "SIGN_IN",
}
export const AuthPage = (): ReactElement => {
  const [authType, setAuthType] = React.useState(AuthTypeEnum.SIGN_IN);

  const handleSetAuthType = (type: AuthTypeEnum) => {
    setAuthType(type);
  };

  return (
    <AuthPageContainerStyled>
      <AuthBrandStyled>
        <h1>
          Tune<span>print</span>
        </h1>
        <p>Music recommendations that learn your taste</p>
      </AuthBrandStyled>

      <AuthPageStyled>
        {authType === AuthTypeEnum.SIGN_UP && <AuthForm />}
        {authType === AuthTypeEnum.SIGN_IN && <AuthFormSignIn />}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Button
            variant="secondary"
            style={{
              width: "90%",
              margin: "0 auto",
              fontWeight: "600",
              marginTop: "20px",
            }}
            onClick={() =>
              handleSetAuthType(
                authType === AuthTypeEnum.SIGN_IN
                  ? AuthTypeEnum.SIGN_UP
                  : AuthTypeEnum.SIGN_IN
              )
            }
          >
            Or {authType === AuthTypeEnum.SIGN_IN ? "Sign up" : "Sign in"}
          </Button>
        </div>
      </AuthPageStyled>
    </AuthPageContainerStyled>
  );
};
