import { Channel, ConsumeMessage } from "amqplib";
import { MessageHandler } from "../message-handler";

export class Consumer {
  constructor(private channel: Channel, private rpcQueueName: string) {}

  async consumeMessage() {
    console.log("RPCE:Server Ready to consume messages");
    this.channel.consume(
      this.rpcQueueName,
      async (msg: ConsumeMessage | null) => {
        if (msg) {
          const { correlationId, replyTo } = msg.properties;
          if (!correlationId || !replyTo) {
            console.error("Missing properties", correlationId, replyTo);
          }
          const operation = msg.properties.headers?.function;
          // console.log("consumed ", JSON.parse(msg.content.toString()));
          // console.log(msg.properties.headers);
          await MessageHandler.handle(
            operation,
            JSON.parse(msg.content.toString()),
            correlationId,
            replyTo
          );
        }
      },
      { noAck: true }
    );
  }
}
