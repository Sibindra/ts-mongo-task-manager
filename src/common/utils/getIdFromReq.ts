import { tokenUtil } from "@/common/utils/tokenUtil";
import type { Request } from "express";
import type { JwtPayload } from "jsonwebtoken";

async function getIDFromRequest(req: Request): Promise<string> {
  const token = req.headers.authorization?.split(" ")[1] as string;
  return (tokenUtil.decodeToken(token) as JwtPayload).id;
}

export { getIDFromRequest };
