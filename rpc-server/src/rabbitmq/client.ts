import { Channel, Connection, connect } from "amqplib";
import config from "../config";
import { Consumer } from "./consumer";
import { Producer } from "./producer";

class RabbitMQClient {
  private isInitialized?: boolean;
  private producer?: Producer;
  private consumer?: Consumer;
  private connection?: Connection;
  private producerChannel?: Channel;
  private consumerChannel?: Channel;

  private constructor() {}

  private static instace: RabbitMQClient;
  public static getInstance() {
    if (!this.instace) {
      this.instace = new RabbitMQClient();
    }
    return this.instace;
  }
  async initialize() {
    if (this.isInitialized) {
      return;
    }
    try {
      this.connection = await connect(config.rabbitMQ.url);
      this.consumerChannel = await this.connection.createChannel();
      this.producerChannel = await this.connection.createChannel();

      const { queue: replyQueue } = await this.consumerChannel.assertQueue(
        config.rabbitMQ.queues.rpcQueue,
        {
          exclusive: true,
        }
      );
      this.producer = new Producer(this.producerChannel);
      this.consumer = new Consumer(this.consumerChannel, replyQueue);

      this.consumer.consumeMessage();
      this.isInitialized = true;
    } catch (err) {
      console.error("rabbitmq error...", err);
    }
  }

  async produce(data: any, correlationId: string, replyToQueue: string) {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return await this.producer?.produceMessage(
      data,
      correlationId,
      replyToQueue
    );
  }
}

export default RabbitMQClient.getInstance();
