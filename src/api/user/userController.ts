import crypto from "crypto";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { env } from "@/common/utils/envConfig";
import { handleServiceResponse } from "@/common/utils/httpHandlers";
import { client } from "@/redis";
import { logger } from "@/server";
import { ethers } from "ethers";
import type { Request, RequestHandler, Response } from "express";
import { StatusCodes } from "http-status-codes";

class UserController {
  public current: RequestHandler = async (req: ExpressRequest, res: Response) => {
    handleServiceResponse(ServiceResponse.success("Fetched current user succesfully", { user: req.user || null }), res);
  };

  public verifySign: RequestHandler = async (req: ExpressRequest, res: Response) => {
    if (req.user) {
      handleServiceResponse(ServiceResponse.success("Signed In Succesfully", req.user), res);
      return;
    }
    if (!client.isReady) {
      handleServiceResponse(ServiceResponse.failure("An error occurred", null, StatusCodes.INTERNAL_SERVER_ERROR), res);
      return;
    }

    try {
      const { address: expectedAddress, signedNonce } = req.body as { address: string; signedNonce: string };
      const nonce = await client.hGet("nonces", expectedAddress);
      if (!nonce) {
        handleServiceResponse(ServiceResponse.failure("Invalid request", null, StatusCodes.NOT_FOUND), res);
        return;
      }

      const address = await ethers.verifyMessage(nonce, signedNonce);
      console.log(address);
      if (address !== expectedAddress) {
        handleServiceResponse(ServiceResponse.failure("Invalid credentials", null, StatusCodes.UNAUTHORIZED), res);
        return;
      }

      const newNonce = crypto.randomBytes(16).toString("base64");
      await client.hSet("nonces", address, newNonce);
      const now = Date.now();
      res.cookie("auth", `${address}:${now}`, {
        signed: true,
        path: "/",
        maxAge: env.COOKIE_EXPIRY * 60 * 60 * 1000,
        domain: env.BACKEND_DOMAIN,
        secure: false,
        sameSite: "lax",
      });
      handleServiceResponse(
        ServiceResponse.success("Signed In Succesfully", {
          user: { address, role: address === env.ADMIN_ADDRESS ? "admin" : "worker" },
        }),
        res,
      );
    } catch (err) {
      console.log(err);
      handleServiceResponse(ServiceResponse.failure("An error occurred", null, StatusCodes.INTERNAL_SERVER_ERROR), res);
    }
  };

  public signIn: RequestHandler = async (req: ExpressRequest, res: Response) => {
    if (req.user) {
      handleServiceResponse(ServiceResponse.failure("You are already logged in", {}, StatusCodes.CONFLICT), res);
      return;
    }
    if (!client.isReady) {
      handleServiceResponse(ServiceResponse.failure("An error occurred", null, StatusCodes.INTERNAL_SERVER_ERROR), res);
      return;
    }
    try {
      const address = req.body.address as string;
      let nonce = await client.hGet("nonces", address);

      if (!nonce) {
        const newNonce = crypto.randomBytes(16).toString("base64");
        await client.hSet("nonces", address, newNonce);
        nonce = newNonce;
      }
      handleServiceResponse(ServiceResponse.success("Fetched nonce succesfully", { nonce }, 201), res);
    } catch (err) {
      logger.error(err);
      handleServiceResponse(ServiceResponse.failure("An error occurred", null, StatusCodes.INTERNAL_SERVER_ERROR), res);
    }
  };
}

export const userController = new UserController();
