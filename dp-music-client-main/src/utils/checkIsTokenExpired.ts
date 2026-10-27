export const checkIsTokenExpired = (expiresIn: number | string): boolean => {
  return Date.now() >= Number(expiresIn);
};
