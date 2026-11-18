Deno.serve(async (request) => {
  if (request.method !== 'POST') {
    return respond({ error: { code: 'METHOD', message: 'Use POST.' } }, 405)
  }
  const authorization = request.headers.get('Authorization')
  if (!authorization?.startsWith('Bearer ')) {
    return respond({ error: { code: 'AUTH', message: 'Sign in is required.' } }, 401)
  }
  if (!Deno.env.get('OPENAI_API_KEY')) {
    return respond({ error: { code: 'AI_NOT_CONFIGURED', message: 'No AI provider is configured.' } }, 503)
  }
  return respond(
    {
      error: {
        code: 'CHART_ENGINE_NOT_ON_SERVER',
        message: 'The guide will not interpret a chart until the server recalculates it. A client-supplied chart is not sent to a model.',
      },
    },
    501,
  )
})

function respond(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}
