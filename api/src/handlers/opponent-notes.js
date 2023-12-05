const corsHeaders = require("./cors-headers");
const {DynamoDBClient} = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({region: "eu-west-2"});
const docClient = DynamoDBDocumentClient.from(client);

async function getOpponentNotes(event) {
  console.log(`Request received: ${JSON.stringify(event.queryStringParameters)}`);

  const {username, opponentName} = event.queryStringParameters;

  const notes = await docClient.send(new GetCommand({
    TableName: "opponent_notes",
    Key: {username, opponentName},
  }));

  return {
    statusCode: 200,
    body: JSON.stringify({ notes }),
    headers: corsHeaders
  };
}

async function createOrUpdateOpponentNotes(event) {
  console.log(`Request received: ${event.body}`);

  const {username, opponentName, notes} = JSON.parse(event.body);

  const existingNotes = await docClient.send(new GetCommand({
    TableName: "opponent_notes",
    Key: {username, opponentName},
  }));

  if (existingNotes.Item) {
    await docClient.send(new UpdateCommand({
      TableName: "opponent_notes",
      Key: {username, opponentName},
      UpdateExpression: "SET notes = :notes",
      ExpressionAttributeValues: {
        ":notes": notes,
      },
    }));
  } else {
    await docClient.send(new PutCommand({
      TableName: "opponent_notes",
      Item: {username, opponentName, notes},
    }));
  }

  return {
    statusCode: 200,
    headers: corsHeaders
  };
}

module.exports = {
  getOpponentNotes,
  createOrUpdateOpponentNotes
}