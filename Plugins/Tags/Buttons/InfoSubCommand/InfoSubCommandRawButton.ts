import { defineEvent } from "../../../../Common/define"

export = {
    Event: defineEvent({
        event: {
            name: "interactionCreate",
            once: false
        },
        on: () => {
        }
    })
}