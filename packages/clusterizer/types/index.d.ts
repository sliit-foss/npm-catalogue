interface Logger {
  info: Function;
  error: Function;
}

interface ClusterizerOptions {
  /**
   * A custom logger object which will be used to log all information about the cluster process activites.
   * This defaults to the inbuilt console logger.
   */
  logger?: Logger;
  /**
   * A specific number of workers to run parallelly in the cluster
   * This defaults to the number of cores in your machine.
   * Providing a number of workers higher than this core count will have no effect on the cluster.
   */
  workers?: Number;
  /**
   * A callback function to be executed once the master process is spawned.
   */
  onMaster?: Function;
  /**
   * A callback function to be executed once a worker process is spawned.
   */
  onWorker?: Function;
  /**
   * A callback function to be executed on a worker process exit.
   */
  onWorkerExit?: Function;
}

/**
 * Takes in a callback function (presumbly containing your server initialization code) and runs a Node.JS cluster with it.
 */
export default function clusterize(
  app: Function,
  options?: ClusterizerOptions
): void;
