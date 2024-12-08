import { Construct } from "constructs"
import * as cdk from "aws-cdk-lib"
import * as dynamodb from "aws-cdk-lib/aws-dynamodb"
import * as lambda from "aws-cdk-lib/aws-lambda"
import * as lambda_nodejs from "aws-cdk-lib/aws-lambda-nodejs"
import * as apigw from "aws-cdk-lib/aws-apigatewayv2"
import * as apigwinteg from "aws-cdk-lib/aws-apigatewayv2-integrations"
import * as route53 from "aws-cdk-lib/aws-route53"
import * as iam from "aws-cdk-lib/aws-iam"
import { AssetWithBuild, StaticWebsite } from "@paulbarmstrong/cdk-static-website-from-asset"
import { DynamicWebappConfig } from "common"
import "dotenv/config"

export class AssociationsGameStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props)

		const hostedZone: route53.IHostedZone | undefined = process.env.HOSTED_ZONE_ID !== undefined && process.env.HOSTED_ZONE_NAME !== undefined ? (
			route53.HostedZone.fromHostedZoneAttributes(this, "HostedZone", {
				hostedZoneId: process.env.HOSTED_ZONE_ID,
				zoneName: process.env.HOSTED_ZONE_NAME
			})
		) : (
			undefined
		)
		const domainName: string | undefined = process.env.DOMAIN_NAME

		const associationsGameRoundsTable = new dynamodb.Table(this, "AssociationsGameRoundsTable", {
			tableName: "AssociationsGameRounds",
			billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
			partitionKey: { name: "partition", type: dynamodb.AttributeType.NUMBER },
			sortKey: { name: "id", type: dynamodb.AttributeType.STRING }
		})

		const httpApiFunction = new lambda_nodejs.NodejsFunction(this, "HttpApiFunction", {
			runtime: lambda.Runtime.NODEJS_20_X,
			entry: "../http-api/src/index.ts",
			timeout: cdk.Duration.seconds(10)
		})
		associationsGameRoundsTable.grantReadWriteData(httpApiFunction)
		httpApiFunction.addToRolePolicy(new iam.PolicyStatement({
			actions: ["bedrock:InvokeModel"],
			resources: ["*"]
		}))

		const httpApi = new apigw.HttpApi(this, "HttpApi", {
			apiName: "AssociationsGameHttpApi",
			corsPreflight: {
				allowHeaders: [
					"Content-Type",
					"X-Amz-Date",
					"Authorization",
					"X-Api-Key",
					"X-Amz-Security-Token"
				],
				allowMethods: [
					apigw.CorsHttpMethod.GET,
					apigw.CorsHttpMethod.POST,
					apigw.CorsHttpMethod.OPTIONS
				],
				allowOrigins: ["*"]
			}
		})
		
		httpApi.addRoutes({
			path: "/{api}",
			methods: [apigw.HttpMethod.GET, apigw.HttpMethod.POST],
			integration: new apigwinteg.HttpLambdaIntegration("HttpLambdaIntegration", httpApiFunction)
		})
		
		const websiteAsset = new AssetWithBuild(this, "WebsiteAsset", {
			path: "../webapp",
			build: (exec, outputDir) => {
				exec("npx react-scripts build --color=always", {
					env: { BUILD_PATH: outputDir },
				})
				exec(`rm -f ${outputDir}/config.json`)
			},
			deployTime: true
		})
		
		const website = new StaticWebsite(this, "Website", {
			asset: websiteAsset,
			domains: hostedZone !== undefined && domainName !== undefined ? [{ hostedZone, domainName }] : undefined
		})
		const dynamicWebappConfig: DynamicWebappConfig = {
			httpApiEndpoint: httpApi.apiEndpoint
		}
		website.addObject({
			key: "config.json",
			body: JSON.stringify(dynamicWebappConfig)
		})

		new cdk.CfnOutput(this, "HttpApiEndpoint", {
			value: httpApi.apiEndpoint
		})

		new cdk.CfnOutput(this, "WebsiteUrl", {
			value: `https://${website.distribution.domainName}`
		})
	}
}