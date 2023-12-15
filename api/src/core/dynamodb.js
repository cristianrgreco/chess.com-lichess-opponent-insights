import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

let docClient;

export function getDocClient() {
  if (!docClient) {
    const client = new DynamoDBClient({
      endpoint: process.env.LOCALSTACK_URI,
      credentials: process.env.LOCALSTACK_URI
        ? {
            secretAccessKey: "test",
            accessKeyId: "test",
          }
        : undefined,
      region: "eu-west-2",
    });

    docClient = DynamoDBDocumentClient.from(client);
  }

  return docClient;
}
