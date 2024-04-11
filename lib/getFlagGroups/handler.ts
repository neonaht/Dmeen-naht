import { DynamoDBClient, GetItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

const client = new DynamoDBClient({});

export const handler = async (): Promise<{ statusCode: number; body: string }> => {

  const params = {
    TableName: process.env.TABLE_NAME,
    KeyConditionExpression: 'PK = :pk',
    ExpressionAttributeValues: {
      ':pk': { S: "flagGroups" }
    }
  };

  try {
    const data = await client.send(new QueryCommand(params));

    if(data === undefined) {
      return {
        statusCode: 404,
        body: 'not found data',
      };
    }

    // Get array of noteContent for each items
    const allItems = data.Items?.map(item => unmarshall(item)['noteContent']);
    if(allItems === undefined) {
      return {
        statusCode: 404,
        body: 'not found items',
      };
    }

    // convert to JSON Object
    for(let i = 0; i < allItems.length; i++) {
      allItems[i] = JSON.parse(allItems[i]);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        "flags_group": allItems
      }),
    };
  } catch (error) {
    console.error('Error retrieving items:', error);
    throw error;
  }
};