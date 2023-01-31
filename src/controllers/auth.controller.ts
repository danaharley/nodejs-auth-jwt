import { CookieOptions, NextFunction, Request, Response } from "express";
import config from "config";
import { CreateUserInput, LoginUserInput } from "../schemas/user.schema";
import {
  createUser,
  findUser,
  findUserById,
  signToken,
} from "../services/user.service";
import AppError from "../utils/appError";
import redisClient from "../utils/redisClient";
import { signJwt, verifyJwt } from "../utils/jwt";

// cookie options
const accessTokenCookieOptions: CookieOptions = {
  expires: new Date(
    Date.now() + config.get<number>("server.accessTokenExpiresIn") * 60 * 1000
  ),
  maxAge: config.get<number>("server.accessTokenExpiresIn") * 60 * 1000,
  httpOnly: true,
  sameSite: "lax",
};

const refreshTokenCookieOptions: CookieOptions = {
  expires: new Date(
    Date.now() + config.get<number>("server.refreshTokenExpiresIn") * 60 * 1000
  ),
  maxAge: config.get<number>("server.refreshTokenExpiresIn") * 60 * 1000,
  httpOnly: true,
  sameSite: "lax",
};

if (config.get<string>("server.node_env") === "production")
  accessTokenCookieOptions.secure = true;

export const registerHandler = async (
  req: Request<{}, {}, CreateUserInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await createUser({
      email: req.body.email,
      name: req.body.name,
      password: req.body.password,
    });

    return res.status(201).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(409).json({
        status: "failed",
        message: "Email already exist",
      });
    }
    next(error);
  }
};

export const loginHandler = async (
  req: Request<{}, {}, LoginUserInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await findUser({ email: req.body.email });

    if (
      !user ||
      !(await user.comparePasswords(user.password, req.body.password))
    ) {
      return next(new AppError("Invalid credentials", 401));
    }

    const { access_token, refresh_token } = await signToken(user);

    res.cookie("access_token", access_token, accessTokenCookieOptions);
    res.cookie("refresh_token", refresh_token, refreshTokenCookieOptions);
    res.cookie("logged_in", true, {
      ...accessTokenCookieOptions,
      httpOnly: false,
    });

    return res.status(200).json({
      status: "success",
      access_token,
    });
  } catch (error: any) {
    next(error);
  }
};

export const refreshAccessTokenHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refresh_token = req.cookies.refresh_token as string;

    const decoded = verifyJwt<{ sub: string }>(
      refresh_token,
      "refreshTokenPrivateKey"
    );

    const message = "Could not refresh access token";

    if (!decoded) {
      return next(new AppError(message, 403));
    }

    const session = await redisClient.get(decoded.sub);

    if (!session) {
      return next(new AppError(message, 403));
    }

    const user = await findUserById(JSON.parse(session)._id);

    if (!user) {
      return next(new AppError(message, 403));
    }

    const access_token = signJwt({ sub: user._id }, "accessTokenPrivateKey", {
      expiresIn: `${config.get<number>("server.accessTokenExpiresIn")}m`,
    });

    res.cookie("access_token", access_token, accessTokenCookieOptions);
    res.cookie("logged_in", true, {
      ...accessTokenCookieOptions,
      httpOnly: false,
    });

    return res.status(200).json({ status: "success", access_token });
  } catch (error: any) {
    next(error);
  }
};

export const logoutHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = res.locals.user;

    await redisClient.del(user._id.toString());
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");
    res.clearCookie("logged_in");

    return res.status(200).json({ message: "success" });
  } catch (error: any) {
    next(error);
  }
};
