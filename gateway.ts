import express, { Request, Response } from "express";
import { Resonate } from "@resonatehq/sdk";

const app = express();
app.use(express.json());

const resonate = Resonate.remote({
  group: "gateway",
});

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

app.get("/unblock-workflow", async (req: Request, res: Response) => {
  // unblock a workflow by resolving a promise
  try {
    const promiseId = req.query.promise_id;

    if (!promiseId || typeof promiseId !== "string") {
      return res.status(400).json({ error: "promise_id is required" });
    }

    await resonate.promises.resolve(promiseId);
    return res.status(200).json({ message: "workflow unblocked" });
  } catch (err: any) {
    return res.status(500).json({
      error: `failed_to_unblock_workflow: ${err?.message ?? String(err)}`,
    });
  }
});

async function main() {
  app.listen(5001, "127.0.0.1", () => {
    console.log(`server listening on http://127.0.0.1:5001`);
  });
}

main();
