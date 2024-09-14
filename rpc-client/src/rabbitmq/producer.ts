import { Channel, ConsumeMessage } from "amqplib";
import config from "../config";
import { randomUUID } from "crypto";
import EventEmitter from "events";

export class Producer {
  constructor(
    private channel: Channel,
    private replyQueueName: string,
    private eventEmitter: EventEmitter
  ) {}

  async produceMessage(data: any) {
    const uuid = randomUUID();
    this.channel.sendToQueue(
      config.rabbitMQ.queues.rpcQueue,
      Buffer.from(JSON.stringify(data)),
      {
        replyTo: this.replyQueueName,
        correlationId: uuid,
        headers: { function: data.operation },
      }
    );

    // Wait for  and send the response
    return new Promise((res, rej) => {
      this.eventEmitter.once(uuid, async (data) => {
        res(JSON.parse(data.content.toString()));
      });
    });
  }
}
