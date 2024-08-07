import { DefineEvent } from "../../../Common/DefineEvent";
import { HasProperties } from "../../../Common/HasProperties";

export = {
  Event: DefineEvent({
    event: {
      name: "error",
      once: false
    },
    on: (e) => {
      if (HasProperties<{ method: string, url: string }>(e, ['method', 'url'])) {
        console.log(`Error: ${ e }\nMethod: ${ e.method }\nUrl: ${ e.url } `);
      }
    }
  })
}
