import cluster from "node:cluster";
import { cpus } from "node:os";
import { ClusterizerOptions } from "../types";

const cpuCount = cpus().length;

const clusterize = async (
  app: (pid: number) => any,
  { logger = console, workers, onMaster, onWorker, onWorkerExit }: ClusterizerOptions = {}
) => {
  const logPrefix = logger !== console ? "Clusterizer - " : "";
  try {
    workers = workers ?? cpuCount;

    if (cluster.isPrimary) {
      if (onMaster) onMaster();
      else logger.info(`${logPrefix}Master ${process.pid} is running`);

      for (let i = 0; i < workers; i++) cluster.fork();

      cluster.on("exit", (worker, code, signal) => {
        if (onWorkerExit) onWorkerExit(worker, code, signal);
        else logger.info(`${logPrefix}Worker ${worker.process.pid} died - code: ${code} - signal: ${signal}`);
      });

      process.on("SIGTERM", () => {
        for (const id in cluster.workers) {
          const worker = cluster.workers[id];
          if (worker && worker.process) {
            worker.process.kill("SIGTERM");
          }
        }
      });
    } else {
      await app(process.pid);
      if (onWorker) onWorker();
      else logger.info(`${logPrefix}Process ${process.pid} started`);
    }
  } catch (e) {
    logger.error(`${logPrefix}Unhandled exception - message: ${e.message} - stack: ${e.stack}`);
  }
};

export default clusterize;
