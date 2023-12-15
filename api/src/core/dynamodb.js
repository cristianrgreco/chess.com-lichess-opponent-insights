import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

let docClient;

export function getDocClient() {
  if (!docClient) {
    const client = new DynamoDBClient({
      region: "eu-west-2",
      ...(process.env.LOCALSTACK_URI ? localstackConfig() : {}),
    });

    docClient = DynamoDBDocumentClient.from(client);
  }

  return docClient;
}

function localstackConfig() {
  return {
    endpoint: process.env.LOCALSTACK_URI,
    credentials: {
      secretAccessKey: "test",
      accessKeyId: "test",
    },
  };
}
