import express from "express";
import type { Request, Response } from "express";
import { Resonate } from "@resonatehq/sdk";

const app = express();
app.use(express.json());

const resonate = new Resonate({
  url: "http://localhost:8001",
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
    const result = await resonate.rpc(
      workflowId,
      "foo-workflow",
      workflowId,
      resonate.options({ target: "poll://any@workers" })
    );
    return res.status(200).json({ message: result });
  } catch (err: any) {
    return res.status(500).json({
      error: "failed_to_start_workflow: " + String(err),
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
    const raw = "human_approval";
    const data = Buffer.from(JSON.stringify(raw), "utf8").toString("base64");
    const result = await resonate.promises.settle(promiseId, "resolved", { data: data });
    console.log(result);
    return res.status(200).json({ message: "workflow unblocked" });
  } catch (e: any) {
    return res.status(500).json({
      error: "failed_to_unblock_workflow: " + String(e),
    });
  }
});

async function main() {
  app.listen(5001, "127.0.0.1", () => {
    console.log("server listening on http://127.0.0.1:5001");
  });
}

main();
