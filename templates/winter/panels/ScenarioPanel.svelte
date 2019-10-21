<script>
  import HeaderTable from "../tables/HeaderTable.svelte";
  import ToggleIcon from "../components/ToggleIcon.svelte";
  import CollapsiblePanel from "./CollapsiblePanel.svelte";
  import RequestPanel from "./RequestPanel.svelte";
  import ResponsePanel from "./ResponsePanel.svelte";

  import { markdown } from "../util.js";

  export let show;
  export let count;
  export let index;
  export let request;
  export let response;
  export let isDarkmode;

  function title(index) {
    if (request.title) {
      return `Request ${request.title}`;
    }

    if (count === 1) {
      return "Request";
    } else {
      return `Request ${index + 1}`;
    }
  }
</script>

<CollapsiblePanel {isDarkmode} {show}>
  <span slot="heading">{title(index)}</span>
  <div slot="body">
    <RequestPanel
      description={request.description}
      headers={request.headers}
      contentType={request.contentType}
      example={request.example}
      schema={request.schema} />

    <ResponsePanel
      title={response.title}
      description={response.description}
      statusCode={response.statusCode}
      headers={response.headers}
      contentType={response.contentType}
      example={response.example}
      schema={response.schema} />
  </div>
</CollapsiblePanel>
