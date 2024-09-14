import { Channel, ConsumeMessage } from "amqplib";

export class Producer {
  constructor(private channel: Channel) {}

  async produceMessage(data: any, correlationId: string, replyToQueue: string) {
    // console.log(`the data is ${data}`);
    this.channel.sendToQueue(replyToQueue, Buffer.from(JSON.stringify(data)), {
      correlationId: correlationId,
    });
  }
}
