![Resonate example app README banner](/assets/resonate-example-app-readme-banner.png)

# Human-in-the-loop

![human in the loop banner](/assets/human-in-the-loop-banner.png)

**Resonate TypeScript SDK**

This example showcases Resonate's ability to block a function execution's progress while awaiting on an action/input from a human.

Instructions on [How to run this example](#how-to-run-the-example) are below.

## Indefinite function suspension

The Human-In-The-Loop example showcases how Resonate enables a function to suspend execution for an indefinite amount of time. That is — where the function yields the promsie, the function stops executing and will only resume when the promise resolves.

```typescript
function* foo(context: Context, workflowId: string) {
  const blockingPromise = yield* context.promise();
  // ...
  // wait for the promise to be resolved
  yield* blockingPromise;
  // ....
```

This enables a wide range of use cases where a function may depend on a human interaction or human input for it to continue.

Use cases like this have tradionally been quite complex to solve for, requiring the steps to be broken up and triggered by schedules or a queuing architecture.

Resonate pushes that complexity into the platform, enabling a much simpler developer experience for these use cases.

## Deduplication

With Resonate, each function invocation pairs with a promise.
Each promise has a unique ID in the system.

The Resonate system deduplicates on the promise ID and will either reconnect to an PENDING progress, or return the result of the RESOLVED promise.

This example showcases how this works in the gateway:

```typescript
app.post("/start-workflow", async (req: Request, res: Response) => {
  // start a workflow using Resonate
  try {
    const data = req.body ?? {};
    const workflowId = data?.workflow_id;

    if (!workflowId || typeof workflowId !== "string") {
      return res.status(400).json({ error: "workflow_id is required" });
    }

    const handle = (await resonate.rpc(
      workflowId,
      "foo",
      workflowId,
      resonate.options({ target: "poll://any@workers" })
    )) as { result: Promise<any> };

    const result = await handle.result;

    return res.status(200).json({ message: result });
  } catch (err: any) {
    return res.status(500).json({
      error: `failed_to_start_workflow: ${err?.message ?? String(err)}`,
    });
  }
});
```

## Load balancing and recovery

This example is capable of showcasing Resonate's automatic loadbalancing and recovery.

Run multiple workers and start multiple workflows.
You will eventually see each worker start executing a workflow.

Try killing one of the workers while the workflow is blocked and watch it recover on the other worker.

## How to run the example

This example application uses [bun](https://bun.sh/) as the TypeScript environment and package manager.

After cloning this repo, change directory into the root of the project and run the following command to install dependencies:

```shell
bun install
```

This example application requires that a Resonate Server is running locally.

```shell
brew install resonatehq/tap/resonate
resonate serve
```

You will need 3 terminals to run this example, one for the HTTP Gateway, one for the Worker, and one to send a cURL request. This does not include the terminal where you might have started the Resonate Server.

In _Terminal 1_, start the HTTP Gateway:

```shell
bun run gateway.ts
```

In _Terminal 2_, start the Worker:

```shell
bun run worker.ts
```

In _Terminal 3_, send the cURL request to start the workflow:

```shell
curl -X POST http://localhost:5001/start-workflow -H "Content-Type: application/json" -d '{"workflow_id": "hitl-001"}'
```

The worker will print a link that you can navigate to in your browser, which sends another request to the gateway, resolving the blocking promise and allowing the workflow to complete.
