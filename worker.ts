import { Resonate } from "@resonatehq/sdk";
import type { Context } from "@resonatehq/sdk";

const resonate = Resonate.remote({
  group: "workers",
});

function sendEmail(ctx: Context, promiseId: string) {
  console.log(`Simulating sending email for promise ${promiseId}`);
  // Simulate sending an email to the user with a link to resolve the promise
  console.log(
    `Email sent! Please resolve the promise by visiting: http://localhost:5001/unblock-workflow?promise_id=${promiseId}`
  );
  return `Email sent for promise ${promiseId}`;
}

function* foo(ctx: Context, workflowId: string) {
  console.log(`foo workflow ${workflowId} started`);

  const blockingPromise = yield* ctx.promise({});
  yield* ctx.run(sendEmail, blockingPromise.id);

  console.log(
    `foo workflow ${workflowId} blocked, waiting on human interaction`
  );

  yield* blockingPromise;

  console.log(`foo workflow ${workflowId} unblocked, promise resolved`);

  return `foo workflow ${workflowId} complete`;
}

resonate.register("foo", foo);

console.log("worker running");
