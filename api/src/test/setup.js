import { LocalstackContainer } from "@testcontainers/localstack";
import { getDocClient } from "../core/dynamodb.js";
import { CreateTableCommand } from "@aws-sdk/client-dynamodb";
import yaml from "yaml";
import fs from "fs";

export async function setup() {
  console.log("Starting Localstack container...");
  globalThis.localstackContainer = await new LocalstackContainer().start();
  process.env.LOCALSTACK_URI = globalThis.localstackContainer.getConnectionUri();

  console.log("Creating DynamoDB tables...");
  await Promise.all(
    Object.values(yaml.parse(fs.readFileSync("serverless.yml", "utf8")).resources.Resources).map((tableDefinition) =>
      getDocClient().send(new CreateTableCommand(tableDefinition.Properties)),
    ),
  );
}

export async function teardown() {
  console.log("Stopping Localstack container...");
  await globalThis.localstackContainer.stop();
}
