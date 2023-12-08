import corsHeaders from "./cors-headers.js";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: "eu-west-2" });
const docClient = DynamoDBDocumentClient.from(client);

export async function getOpponentNotes(event) {
  console.log(`Request received: ${JSON.stringify(event.queryStringParameters)}`);

  const { username, opponentName } = event.queryStringParameters;

  const dbResponse = await docClient.send(
    new GetCommand({
      TableName: "opponent_notes",
      Key: { username, opponent_name: opponentName },
    }),
  );

  return {
    statusCode: 200,
    body: JSON.stringify({ notes: dbResponse.Item?.notes }),
    headers: corsHeaders,
  };
}

export async function createOrUpdateOpponentNotes(event) {
  console.log(`Request received: ${event.body}`);

  const { username, opponentName, notes } = JSON.parse(event.body);

  const existingNotes = await docClient.send(
    new GetCommand({
      TableName: "opponent_notes",
      Key: { username, opponent_name: opponentName },
    }),
  );

  if (existingNotes.Item) {
    await docClient.send(
      new UpdateCommand({
        TableName: "opponent_notes",
        Key: { username, opponent_name: opponentName },
        UpdateExpression: "SET notes = :notes",
        ExpressionAttributeValues: { ":notes": notes },
      }),
    );
  } else {
    await docClient.send(
      new PutCommand({
        TableName: "opponent_notes",
        Item: { username, opponent_name: opponentName, notes },
      }),
    );
  }

  return {
    statusCode: 200,
    headers: corsHeaders,
  };
}
