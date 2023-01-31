import { createClient } from "redis";
import config from "config";

const redisClient = createClient({ url: config.get<string>("redis.url") });

export const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log("Redis Client Connected!");
  } catch (error: any) {
    console.log(error.message);
  }
};

redisClient.on("error", (error: any) => console.log(error));

export default redisClient;
