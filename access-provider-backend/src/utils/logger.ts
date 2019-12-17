import express from 'express'

export const requestLogger = (
  request: express.Request,
  response: express.Response,
  next: express.NextFunction
): void => {
  console.log('---')
  if (request.method === 'POST') {
    console.log('req', request.method, request.path, '   ', JSON.stringify(request.body))
  } else {
    console.log('req', request.method, request.path)
  }
  next()
}

export const responseLogger = (
  request: express.Request,
  response: express.Response,
  next: express.NextFunction
): void => {
  const oldWrite = response.write
  const oldEnd = response.end

  const chunks: any[] = []

  response.write = (...args: any[]): boolean => {
    chunks.push(args[0])

    // @ts-ignore
    return oldWrite.apply(response, args)
  }

  response.end = (...args: any[]): boolean => {
    if (args[0]) {
      chunks.push(args[0])
    }

    let body = ''
    if (typeof args[0] === 'string') {
      body = args[0]
    } else {
      body = Buffer.concat(chunks).toString('utf8')
    }

    console.log('res', request.method, request.path, response.statusCode, body)

    // @ts-ignore
    return oldEnd.apply(response, args)
  }

  next()
}
