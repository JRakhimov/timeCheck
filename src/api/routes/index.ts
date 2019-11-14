import { Router } from "express";
import { Client } from "../../whatsapp/Client";

export const router = (whatsAppClient: Client) => {
  const router = Router();

  router.get("/", (_req, res) => res.status(200).json({ status: true, message: "Server is ON" }));

  router.all("*", (_req, res) => res.status(404).send({ status: false, message: "Not Found" }));

  return router;
};
