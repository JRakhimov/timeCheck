import appRoot from "app-root-path";
import log4js from "log4js";

log4js.configure({
  appenders: {
    toFile: {
      maxLogSize: 3 * 1024 * 1024, // = 10Mb
      filename: `${appRoot}/logs/app.log`,
      encoding: "utf-8",
      compress: true,
      mode: 0o0640,
      type: "file"
    },

    out: {
      type: "stdout"
    }
  },

  categories: {
    default: { appenders: ["toFile", "out"], level: "trace" }
  }
});

export const Logger = (prefix: string): log4js.Logger => log4js.getLogger(prefix);
