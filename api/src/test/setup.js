import { LocalstackContainer } from "@testcontainers/localstack";
import { getDocClient } from "../core/dynamodb.js";
import { CreateTableCommand } from "@aws-sdk/client-dynamodb";

export async function setup() {
  console.log("Starting Localstack container...");
  globalThis.localstackContainer = await new LocalstackContainer().start();
  process.env.LOCALSTACK_URI = globalThis.localstackContainer.getConnectionUri();

  console.log("Creating DynamoDB tables...");
  await getDocClient().send(
    new CreateTableCommand({
      TableName: "opponent_notes",
      KeySchema: [
        { AttributeName: "username", KeyType: "HASH" },
        { AttributeName: "opponent_name", KeyType: "RANGE" },
      ],
      AttributeDefinitions: [
        { AttributeName: "username", AttributeType: "S" },
        { AttributeName: "opponent_name", AttributeType: "S" },
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1,
      },
    }),
  );
}

export async function teardown() {
  console.log("Stopping Localstack container...");
  await globalThis.localstackContainer.stop();
}
