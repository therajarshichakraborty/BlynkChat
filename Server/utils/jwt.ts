import jwt from "jsonwebtoken";
import { env } from "@/config/env";
import ApiError from "@/utils/api-error";
import { Response } from "express";

export type Time = `${number}${"s" | "m" | "h" | "d" | "w" | "y"}`;
export interface Cookie {
  res?: Response;
  userId?: string;
}

export const setJwtToken = ({ res, userId }: Cookie) => {
  const payload = { userId };
  const expiresIn = env.JWT_ACCESS_EXPIRES_IN as Time;

  try {
    const token = jwt.sign(payload, env.JWT_ACCESS_SECRET!, {
      audience: ["users"],
      expiresIn: expiresIn || "7d",
    });
    return res?.cookie("access token", token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production" ? true : false,
      sameSite: env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  } catch (error: any) {
    throw new ApiError(500, "Invalid Token", error.message);
  }
};

export const clearJwtToken = ({ res }: Cookie) => {
  return res?.clearCookie("access token", {
    path: "/",
  });
};
