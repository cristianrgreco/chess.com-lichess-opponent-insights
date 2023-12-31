import corsHeaders from "./cors-headers.js";
import { getDocClient } from "../core/dynamodb.js";
import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

export async function getOpponentNotes(event) {
  console.log(`Request received: ${JSON.stringify(event.queryStringParameters)}`);

  const { username, opponentName } = event.queryStringParameters;

  const dbResponse = await getDocClient().send(
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

  await getDocClient().send(
    new PutCommand({
      TableName: "opponent_notes",
      Item: { username, opponent_name: opponentName, notes },
    }),
  );

  return {
    statusCode: 200,
    headers: corsHeaders,
  };
}
