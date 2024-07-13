export const func = {
    name: 'get_current_weather',
    description: 'Get the current weather in a given location',
    parameters: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'The city and state, e.g. San Francisco, CA'
        }
      },
      required: ['location']
    }
  }
  
  export const tools = [
    {
      type: 'function',
      function: func
    }
  ]
  
  export const messages = [
    {
      role: 'user',
      content: 'What is the weather like in San Francisco?'
    }
  ]