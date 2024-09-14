import { Channel, ConsumeMessage } from "amqplib";
import EventEmitter from "events";

export class Consumer {
  constructor(
    private channel: Channel,
    private replyQueueName: string,
    private eventEmitter: EventEmitter
  ) {}

  async consumeMessage() {
    console.log("Ready to consume messages");
    this.channel.consume(
      this.replyQueueName,
      (msg: ConsumeMessage | null) => {
        if (msg) {
          // console.log(
          //   "this is reply queue, ",
          //   JSON.parse(msg.content.toString())
          // );
          // Publish an event and pass the data so that producer knwos that the request witht this co-relatio-id
          //  has been processed

          this.eventEmitter.emit(msg.properties.correlationId.toString(), msg);
        }
      },
      { noAck: true }
    );
  }
}
