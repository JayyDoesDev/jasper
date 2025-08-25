// this takes the file(s) that have the purged messages and converts them to a json w the same structure as the json maker command

export default function parse(file){
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload= () =>{
            const text = reader.result;
            const lines = JSON.parse(text)

            const parsed = []

            for(let line of lines){
                const messageid = line.messageid ?? "not found"
                const username = line.username ?? "not found"
                const id = line.id ?? "not found"
                const timestamp = new Date(line.timestamp*1000).toLocaleString()
                const content = line.content ?? "not found"

                if(line.reply){
                    parsed.push([messageid, timestamp, username, id.trim(), content, line.reply.username, line.reply.content])
                }
                else{
                    parsed.push([messageid, timestamp, username, id.trim(), content])
                }
            }
            resolve(parsed)
        }
        reader.onerror = () => {
            reject(reader.error);
        };

        reader.readAsText(file);
    })
}