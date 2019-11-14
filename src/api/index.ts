import ExpressApp, { Express } from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";

import { Client } from "../whatsapp/Client";
import { Logger } from "../utils";
import { router } from "./routes";
import { port } from "../config";

export default async (whatsAppClient: Client): Promise<Express> => {
  const app = ExpressApp();
  const log = Logger("Express");

  app.use(morgan("dev", { stream: { write: (reqs): void => log.info(reqs) } }));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(cors());

  app.use(router(whatsAppClient));

  app.listen(port, () => log.info(`.::Magic happens at ${port} port::.`));

  return app;
};
