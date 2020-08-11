import express from "express";
import preferHeader from "parse-prefer-header";
import { parse } from "./parser";

export default function router(elements) {
  const router = express.Router();

  elements.forEach((element) => {
    const actions = parse(element);

    actions.forEach((action) => {
      const method = action.method.toLowerCase();
      const pathName = normalizePath(action.path);

      router[method](pathName, (req, res) => handler(action, req, res));
    });
  });

  return router;
}

function handler(action, req, res) {
  const { status } = preferHeader(req.get("Prefer"));

  let responses = action.responses.filter((response) => {
    return response.statusCode === status;
  });

  if (responses.length === 0) {
    responses = action.responses;
  }

  const [response, ...rest] = responses;

  if (!response.contentType) {
    res.status(response.statusCode).end();
    return;
  }

  const formats = {};

  responses.forEach((response) => {
    formats[response.contentType] = () => res.send(response.body);
  });

  res.status(response.statusCode).format(formats);
}

function normalizePath(pathName) {
  if (pathName) {
    const str = pathName.replace(/{/g, ":").replace(/}/g, "");
    return str === "" ? "/" : str;
  }

  return pathName;
}
