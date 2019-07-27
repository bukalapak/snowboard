const express = require("express");
const preferHeader = require("parse-prefer-header");
const { flattenDepth, find } = require("lodash");

function normalizePath(pathName) {
  if (pathName) {
    const str = pathName.replace(/{/g, ":").replace(/}/g, "");
    return str === "" ? "/" : str;
  }

  return pathName;
}

function handler(action, req, res) {
  const { status } = preferHeader(req.get("Prefer"));

  let content = find(action.transactions, obj => {
    return obj.response.statusCode === parseInt(status, 10);
  });

  if (!content) {
    content = action.transactions[0];
  }

  const item = content.response;

  if (!(item.example && item.contentType)) {
    res.status(item.statusCode).end();
    return;
  }

  const contentType = item.contentType === "" ? "default" : item.contentType;

  res.status(item.statusCode).format({
    [contentType]: () => res.send(item.example)
  });
}

function mockRouter(results) {
  const router = express.Router();
  const result = results.map(item => {
    return item.actions.map(action => {
      action.pathRoute = normalizePath(action.path);
      return action;
    });
  });

  const actions = flattenDepth(result, 2);

  actions.forEach(action => {
    action.transactions.forEach(transaction => {
      console.log(
        [
          action.method.toUpperCase(),
          transaction.response.statusCode,
          action.path
        ].join("\t")
      );
    });

    router[action.method.toLowerCase()](action.pathRoute, (req, res) => {
      handler(action, req, res);
    });
  });

  return router;
}

module.exports = {
  router: mockRouter
};
