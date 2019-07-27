const { table, getBorderCharacters } = require("table");

const tableConfig = {
  border: getBorderCharacters("ramac")
};

function lint(result) {
  const data = result.map(item => {
    return [
      item.location
        .map(loc => `line ${loc.line}, column ${loc.column}`)
        .join(" - "),
      item.severity,
      item.description
    ];
  });

  data.unshift(["Location", "Severity", "Description"]);
  console.log(table(data, tableConfig));
}

async function list(result) {
  result.actions.forEach(action => {
    action.transactions.forEach(transaction => {
      console.log(
        [
          action.method.toUpperCase(),
          transaction.response.statusCode,
          action.path
        ].join("\t")
      );
    });
  });
}

module.exports = {
  lint,
  list
};
