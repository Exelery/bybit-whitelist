function waitMain(time: number, text?: string) {
  const minutes = Math.floor(time / 60000);
  const seconds = (time % 60000) / 1000;
  // text ? console.log(text) : text;
  if (time > 10_000) {
    console.log(`Waiting ${text ? text : ''} for ${minutes} minutes and ${seconds} seconds...`);
  }
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

/**
 * Waits for a random amount of time between min and max seconds, then prints the given text.
 *
 * @param min - The minimum number of seconds to wait.
 * @param max - The maximum number of seconds to wait.
 * @param text - The text to print after waiting.
 */
export async function wait(min: number, max: number, text?: string): Promise<void> {
  // Convert min and max from seconds to milliseconds
  const minMs = min * 1000;
  const maxMs = max * 1000;

  // Calculate a random wait time between minMs and maxMs
  const waitTime = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;

  // Create a promise that resolves after waitTime milliseconds
  await waitMain(waitTime, text);

  // Print the given text
}
