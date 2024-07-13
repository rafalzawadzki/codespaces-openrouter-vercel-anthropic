import { OpenAIStream, StreamingTextResponse } from 'ai'
import {
  ChatCompletionMessageParam,
  ChatCompletionTool
} from 'openai/resources'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createOpenAI } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { z } from 'zod'
import OpenAI from 'openai'
import { messages, tools } from './data'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  try {
    //let modelName = 'anthropic/claude-3.5-sonnet'
    let modelName = 'gpt-4o'
    return legacyVercelStream(modelName)
  } catch (e: any) {
    console.error(e)
    return new Response('Error', { status: 500 })
  }
}

const legacyVercelStream = async (modelName: string) => {
  const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1'
  })
  const response = await openai.chat.completions.create({
    model: modelName,
    stream: true,
    messages: messages as unknown as ChatCompletionMessageParam[],
    tool_choice: 'auto',
    tools: tools as unknown as ChatCompletionTool[]
  })
  const stream = OpenAIStream(response)
  return new StreamingTextResponse(stream)
}

const newVercelStream = async (modelName: string) => {
  const anthropic = createAnthropic({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1'
  })

  const openai = createOpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1'
  })

  const result = await streamText({
    model: openai(modelName),
    prompt: 'Write a vegetarian lasagna recipe for 4 people.',
    tools: {
      celsiusToFahrenheit: {
        description: 'Converts celsius to fahrenheit',
        parameters: z.object({
          value: z.string().describe('The value in celsius')
        }),
        execute: async ({ value }) => {
          const celsius = parseFloat(value)
          const fahrenheit = celsius * (9 / 5) + 32
          return `${celsius}°C is ${fahrenheit.toFixed(2)}°F`
        }
      }
    }
  })
  return result.toAIStreamResponse()
}

const justFetch = async (model: string) => {
  const response = await fetch(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        //model: 'openai/gpt-4o',
        messages: messages,
        tools: tools,
        tool_choice: 'auto'
      })
    }
  )
  return response.json()
}