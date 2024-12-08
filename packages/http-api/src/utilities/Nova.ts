import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime"
import { lazy } from "common"

const bedrockRuntimeClient = lazy(() => new BedrockRuntimeClient())

export async function askNova(prompt: String): Promise<string> {
	const res = await bedrockRuntimeClient.send(new InvokeModelCommand({
		modelId: "us.amazon.nova-micro-v1:0",
		body: JSON.stringify({ "messages": [{ "role": "user", "content": [{ "text": prompt }] }] })
	}))
	const resJson = JSON.parse(Buffer.from(res.body).toString())
	if (resJson.stopReason !== "end_turn") throw new Error(`Encountered stop reason: "${resJson.stopReason}".`)
	return resJson.output.message.content.map(content => content.text).join("\n")
}
