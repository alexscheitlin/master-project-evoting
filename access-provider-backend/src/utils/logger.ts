import express from 'express'

export const requestLogger = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
  console.log('---')
  if (request.method === 'POST') {
    console.log('req', request.method, request.path, '   ', JSON.stringify(request.body))
  } else {
    console.log('req', request.method, request.path)
  }
  next()
}

export const responseLogger = (request: express.Request, response: express.Response, next: express.NextFunction): void => {
  let oldWrite = response.write
  let oldEnd = response.end

  let chunks: any[] = []

  response.write = function(chunk: any): boolean {
    chunks.push(chunk)

    // @ts-ignore
    return oldWrite.apply(response, arguments)
  }

  response.end = function(chunk: any): boolean {
    if (chunk) {
      chunks.push(chunk)
    }

    let body = ''
    if (typeof chunk === 'string') {
      body = chunk
    } else {
      body = Buffer.concat(chunks).toString('utf8')
    }

    console.log('res', request.method, request.path, response.statusCode, body)

    // @ts-ignore
    return oldEnd.apply(response, arguments)
  }

  next()
}
