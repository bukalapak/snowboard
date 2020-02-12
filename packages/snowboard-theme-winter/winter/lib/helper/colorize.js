export default function(str, prefix = "is-") {
  switch (str) {
    case "GET":
      return `${prefix}success`;
    case "POST":
      return `${prefix}link`;
    case "PUT":
      return `${prefix}primary`;
    case "PATCH":
      return `${prefix}info`;
    case "DELETE":
      return `${prefix}danger`;
    case 200:
    case 201:
    case 202:
    case 204:
      return `${prefix}info`;
    case 401:
    case 403:
    case 404:
    case 422:
      return `${prefix}warning`;
    case 500:
      return `${prefix}danger`;
  }
}
