import { DocumentType } from "@typegoose/typegoose";
import { omit } from "lodash";
import { FilterQuery, QueryOptions } from "mongoose";
import config from "config";
import userModel, { User } from "../models/user.model";
import { signJwt } from "../utils/jwt";
import redisClient from "../utils/redisClient";

const excludedFields = ["password"];

export const createUser = async (input: Partial<User>) => {
  const user = await userModel.create(input);
  return omit(user.toJSON(), excludedFields);
};

export const findAllUsers = async () => {
  return await userModel.find();
};

export const findUser = async (
  query: FilterQuery<User>,
  options: QueryOptions = {}
) => {
  return userModel.findOne(query, {}, options).select("+password");
};

export const findUserById = async (id: string) => {
  const user = userModel.findById(id).lean();
  return omit(user, excludedFields);
};

export const signToken = async (user: DocumentType<User>) => {
  const access_token = signJwt(
    {
      sub: user._id,
    },
    "accessTokenPrivateKey",
    {
      expiresIn: `${config.get<number>("server.accessTokenExpiresIn")}m`,
    }
  );

  const refresh_token = signJwt(
    {
      sub: user._id,
    },
    "refreshTokenPrivateKey",
    {
      expiresIn: `${config.get<number>("server.refreshTokenExpiresIn")}m`,
    }
  );

  // create a session
  redisClient.set(user._id.toString(), JSON.stringify(user), {
    EX: 60 * 60,
  });

  return { access_token, refresh_token };
};
