const NODE_ENV = process.env.NODE_ENV;

const ORIGIN = "http://localhost:3000";

const SERVER_PORT = process.env.PORT ? Number(process.env.PORT) : 2008;

const ACCESS_TOKEN_EXPIRES_IN = 15;
const REFRESH_TOKEN_EXPIRES_IN = 59;

const ACCESS_TOKEN_PRIVATE_KEY = process.env.ACCESS_TOKEN_PRIVATE_KEY;
const REFRESH_TOKEN_PRIVATE_KEY = process.env.REFRESH_TOKEN_PRIVATE_KEY;

const MONGODB_USERNAME = process.env.MONGODB_USERNAME;
const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD;
const MONGODB_URL = `mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@cluster0.6wdos5n.mongodb.net/?retryWrites=true&w=majority`;

const REDIS_URL = "redis://localhost:6379";

export default {
  server: {
    node_env: NODE_ENV,
    origin: ORIGIN,
    port: SERVER_PORT,
    accessTokenExpiresIn: ACCESS_TOKEN_EXPIRES_IN,
    refreshTokenExpiresIn: REFRESH_TOKEN_EXPIRES_IN,
    accessTokenPrivateKey: ACCESS_TOKEN_PRIVATE_KEY,
    refreshTokenPrivateKey: REFRESH_TOKEN_PRIVATE_KEY,
  },
  mongo: {
    username: MONGODB_USERNAME,
    password: MONGODB_PASSWORD,
    url: MONGODB_URL,
  },
  redis: {
    url: REDIS_URL,
  },
};
