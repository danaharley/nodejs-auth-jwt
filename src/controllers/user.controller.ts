import { NextFunction, Request, Response } from "express";
import { findAllUsers } from "../services/user.service";

export const getMeHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = res.locals.user;

    return res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

export const getAllUserHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await findAllUsers();

    return res.status(200).json({
      status: "success",
      result: users.length,
      data: {
        users,
      },
    });
  } catch (error: any) {
    next(error);
  }
};
