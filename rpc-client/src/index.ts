import express, { Request, Response } from "express";
import RabbitMQClient from "./rabbitmq/client";

const app = express();
app.use(express.json());
const port = 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript with Express!");
});

app.post("/operate", async (req, res, next) => {
  const response = await RabbitMQClient.produce(req.body);
  res.json({ response });
});
app.listen(port, () => {
  console.log(`Client Server is running on http://localhost:${port}`);

  RabbitMQClient.initialize();
});
