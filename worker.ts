import { Resonate } from "@resonatehq/sdk";
import type { Context } from "@resonatehq/sdk";

const resonate = new Resonate({
  url: "http://localhost:8001",
  group: "workers",
});

async function sendEmail(_: Context, promiseId: string) {
  // Simulate sending an email to the user with a link to resolve the promise
  console.log(
    `Email sent! Please resolve the promise by visiting: http://localhost:5001/unblock-workflow?promise_id=${promiseId}`
  );
  return `Email sent for promise ${promiseId}`;
}

function* fooWorkflow(ctx: Context, workflowId: string) {
  const blockingPromise = yield* ctx.promise({});
  yield* ctx.run(sendEmail, blockingPromise.id);
  console.log(`workflow blocked, waiting on human interaction`);
  // Wait for the promise to be resolved
  const data = yield* blockingPromise;
  console.log(
    `foo workflow ${workflowId} unblocked, promise resolved with ${data}`
  );
  return `foo workflow ${workflowId} complete`;
}

resonate.register("foo-workflow", fooWorkflow);

console.log("worker running");
