import { NextRequest } from "next/server";

export const config = {
  runtime: "edge",
};

const handler = async (_: NextRequest) => {
  return new Response("Alive!", {
    status: 200,
  });
};

export default handler;
