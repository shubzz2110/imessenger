import { io } from "socket.io-client";

const ENDPOINT = "http://localhost:4000";

export const createSocket = (token: string) => {
  return io(ENDPOINT, {
    auth: {
      token,
    },
  });
};
