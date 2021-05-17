'use strict';

class Util {

  /**
   * Async version of `setTimeout`.
   * @param {number} timeout - milliseconds
   * @returns {Promise<unknown>}
   * @memberof Util
   */
  static async wait(timeout) {
    if (typeof timeout !== 'number') throw new TypeError('expected_timeout_number');
    return new Promise(resolve => setTimeout(resolve, timeout));
  }

  /**
   * Method that applies a retry strategy to the provided async function. By default the async
   * function will be retried directly, override 'interval' for a different strategy.
   * @param {AsyncFunction} method - Method to execute and retry when failed
   * @param {Number} [times=1] - Number of times the `method` will be retried after failure.
   * @param {number|function} [interval=0] - Function (dynamic retry interval) or Number
   * (static retry interval).
   * @returns {Promise<unknown>}
   */
  static async wrapAsyncWithRetry(
    method,
    times = 1,
    interval = 0,
  ) {
    if (typeof method !== 'function') throw TypeError('expected_function');
    if (typeof times !== 'number') throw TypeError('expected_times_number');
    if (typeof interval !== 'number' && typeof interval !== 'function') {
      throw TypeError('expected_interval_number_or_function');
    }
    return new Promise((resolve, reject) => {
      let retries = 0;

      // Create function which executes the provided method and resolves the promise if success,
      // if failure it will wait for the provided interval and then execute the method again.
      function executeMethod() {
        method()
          .then(resolve)
          .catch(err => {
            if (times > retries) {
              retries += 1;

              // Determine time to wait
              const waitTime = typeof interval === 'function' ? interval(retries) : interval;
              return Util.wait(waitTime).then(executeMethod);
            }
            return reject(err);
          });
      }

      // Start the execution
      executeMethod();
    });
  }

}

module.exports = Util;
