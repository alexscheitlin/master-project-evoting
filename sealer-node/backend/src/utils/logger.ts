import express from "express";

const logger = (
  request: express.Request,
  response: express.Response,
  next: express.NextFunction
) => {
  if (request.method === "POST") {
    console.log(
      `${request.method} ${request.path} ${JSON.stringify(request.body)}`
    );
  } else {
    console.log(`${request.method} ${request.path}`);
  }
  next();
};

export default logger;
