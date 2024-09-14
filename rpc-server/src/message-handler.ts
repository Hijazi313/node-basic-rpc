import rabbitClient from "./rabbitmq/client";

export class MessageHandler {
  static async handle(
    operation: string,
    data: any,
    cId: string,
    replyTo: string
  ) {
    let response = {};

    const { num1, num2 } = data;
    console.log(`The operation is `, operation);

    switch (operation) {
      case "multiply":
        response = num1 * num2;
        break;

      case "sum":
        response = num1 + num2;
        break;

      default:
        response = 0;
        break;
    }

    await rabbitClient.produce(response, cId, replyTo);
  }
}
