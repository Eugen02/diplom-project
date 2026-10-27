export const checkIsFacebookProfileUrlValid = (url: string): boolean => {
  const FaceBookUrlRegex = new RegExp(
    /^(https?:\/\/)?(www\.)?facebook.com\/[a-zA-Z0-9(\.\?)?]/
  );

  return FaceBookUrlRegex.test(url);
};
