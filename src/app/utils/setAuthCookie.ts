import { Response } from "express";

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export const setAuthCookie = (res: Response, tokens: Tokens) => {
  // Access Token cookie
  res.cookie("accessToken", tokens.accessToken, {
    httpOnly: true, // prevent JS access
    secure: true, // HTTPS only
    sameSite: "none", // protect against CSRF
    path: "/", // cookie path
    maxAge: 2 * 60 * 60 * 1000, // 2 hours
  });

  // Refresh Token cookie
  res.cookie("refreshToken", tokens.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};
