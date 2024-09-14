import { Channel, Connection, connect } from "amqplib";
import config from "../config";
import { Consumer } from "./consumer";
import { Producer } from "./producer";
import EventEmitter from "events";

class RabbitMQClient {
  private isInitialized?: boolean;
  private producer?: Producer;
  private consumer?: Consumer;
  private connection?: Connection;
  private producerChannel?: Channel;
  private consumerChannel?: Channel;
  private eventEmitter: EventEmitter = new EventEmitter();

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

      const { queue: replyQueueName } = await this.consumerChannel.assertQueue(
        "",
        {
          exclusive: true,
        }
      );

      // Ensure eventEmitter is not undefined before passing
      if (!this.eventEmitter) {
        this.eventEmitter = new EventEmitter();
      }
      this.producer = new Producer(
        this.producerChannel,
        replyQueueName,
        this.eventEmitter
      );
      this.consumer = new Consumer(
        this.consumerChannel,
        replyQueueName,
        this.eventEmitter
      );

      this.consumer.consumeMessage();
      this.isInitialized = true;
    } catch (err) {
      console.error("rabbitmq error... from client server", err);
    }
  }

  async produce(data: any) {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return await this.producer?.produceMessage(data);
  }
}

export default RabbitMQClient.getInstance();
