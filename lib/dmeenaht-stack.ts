import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import path from 'path';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class DmeenahtStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Main API
    const myFirstApi = new cdk.aws_apigateway.RestApi(this, 'myFirstApi', {});

    // Dmeen Query Flag Groups
    const flagGroupsTable = new cdk.aws_dynamodb.Table(this, 'flagGroupsTable', {
      partitionKey: {
        name: 'PK',
        type: cdk.aws_dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'SK',
        type: cdk.aws_dynamodb.AttributeType.STRING,
      },
      billingMode: cdk.aws_dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    const getFlagGroups = new cdk.aws_lambda_nodejs.NodejsFunction(this, 'getFlagGroups', {
      entry: path.join(__dirname, 'getFlagGroups', 'handler.ts'),
      handler: 'handler',
      environment: {
        TABLE_NAME: flagGroupsTable.tableName, // VERY IMPORTANT
      },
    });

    const createFlagGroups = new cdk.aws_lambda_nodejs.NodejsFunction(this, 'createFlagGroups', {
      entry: path.join(__dirname, 'createFlagGroups', 'handler.ts'),
      handler: 'handler',
      environment: {
        TABLE_NAME: flagGroupsTable.tableName, // VERY IMPORTANT
      },
    });

    const queryFlagGroups = new cdk.aws_lambda_nodejs.NodejsFunction(this, 'queryFlagGroups', {
      entry: path.join(__dirname, 'queryFlagGroups', 'handler.ts'),
      handler: 'handler',
      environment: {
        TABLE_NAME: flagGroupsTable.tableName, // VERY IMPORTANT
      },
    });

    flagGroupsTable.grantReadData(getFlagGroups);
    flagGroupsTable.grantWriteData(createFlagGroups);
    flagGroupsTable.grantReadData(queryFlagGroups);
    flagGroupsTable.grantWriteData(queryFlagGroups);

    const flagGroupsResource = myFirstApi.root.addResource('query');
    flagGroupsResource.addResource('get').addMethod('GET', new cdk.aws_apigateway.LambdaIntegration(getFlagGroups));
    flagGroupsResource.addResource('create').addMethod('POST', new cdk.aws_apigateway.LambdaIntegration(createFlagGroups));
    flagGroupsResource.addMethod('POST', new cdk.aws_apigateway.LambdaIntegration(queryFlagGroups));

  }
}
