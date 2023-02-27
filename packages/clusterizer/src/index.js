import cluster from "node:cluster";
import { cpus } from "node:os";

const cpuCount = cpus().length;

const logPrefix = "Clusterizer -";

const clusterize = async (
  app,
  { logger, workers, onMaster, onWorker, onWorkerExit } = {}
) => {
  if (!logger) logger = console;
  try {
    workers = workers ?? cpuCount;

    if (cluster.isPrimary) {
      if (onMaster) onMaster();
      else logger.info(`${logPrefix} Master ${process.pid} is running`);

      for (let i = 0; i < workers; i++) cluster.fork();

      cluster.on("exit", (worker, code, signal) => {
        if (onWorkerExit) onWorkerExit(worker, code, signal);
        else
          logger.info(
            `${logPrefix} Worker ${worker.process.pid} died - code: ${code} - signal: ${signal}`
          );
      });
    } else {
      await app();
      if (onWorker) onWorker();
      else logger.info(`${logPrefix} Process ${process.pid} started`);
    }
  } catch (e) {
    logger.error(
      `${logPrefix} Unhandled exception - message: ${e.message} - stack: ${e.stack}`
    );
  }
};

export default clusterize;
