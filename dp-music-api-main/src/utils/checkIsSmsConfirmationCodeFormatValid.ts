export const checkIsSmsConfirmationCodeFormatValid = (
  code: string
): boolean => {
  return code.length === 4 && !Number.isNaN(Number(code));
};
