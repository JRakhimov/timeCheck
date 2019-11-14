import { Router } from "express";
import { Client } from "../../../whatsapp/Client";

export const client = (whatsAppClient: Client): Router => {
  const router = Router();

  router.get("/status", async (_req, res) => {
    const isConnected = whatsAppClient.isConnected();

    res.status(200).json({ status: true, isConnected });
  });

  return router;
};
