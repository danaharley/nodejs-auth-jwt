import jwt, { SignOptions } from "jsonwebtoken";
import config from "config";

export const signJwt = (
  payload: Object,
  key: "accessTokenPrivateKey" | "refreshTokenPrivateKey",
  options: SignOptions = {}
) => {
  const privateKey = Buffer.from(
    config.get<string>(`server.${key}`),
    "base64"
  ).toString("ascii");

  console.log(config.get<string>(`server.${key}`));

  return jwt.sign(payload, privateKey, {
    ...(options && options),
  });
};

export const verifyJwt = <T>(
  token: string,
  key: "accessTokenPrivateKey" | "refreshTokenPrivateKey"
): T | null => {
  try {
    const privateKey = Buffer.from(
      config.get<string>(`server.${key}`),
      "base64"
    ).toString("ascii");

    return jwt.verify(token, privateKey) as T;
  } catch (error: any) {
    return null;
  }
};
