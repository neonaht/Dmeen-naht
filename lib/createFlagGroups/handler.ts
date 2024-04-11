import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({});

export const handler = async (event: {
  body: string;
}): Promise<{ statusCode: number; body: string }> => {
  const content = event.body;

  if (content === undefined) {
    return {
      statusCode: 400,
      body: 'You must pass a content',
    };
  }

  const flagGroupsId = uuidv4();

  await client.send(
    new PutItemCommand({
      TableName: process.env.TABLE_NAME,
      Item: {
        PK: { S: "flagGroups" },
        SK: { S: flagGroupsId },
        noteContent: { S: content }, // As String
      },
    }),
  );
  return {
    statusCode: 200,
    body: JSON.stringify({ flagGroupsId }),
  };
};