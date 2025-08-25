<script>
    import parse from "../utils/msgParser.js"
    import "./app.css"
    let messages = []

    function importPurged(){
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (event) => {
            const file = event.target.files[0];
            messages = await parse(file)
        }
        input.click();
    }
</script>
<button class="button" on:click={() => importPurged()}>Import Messages</button>

<ul>
{#each messages as [messageid, timestamp, username, id, content, repliedUser, repliedContent]}
    <li class="message">
        {#if repliedUser} 
        <div class="reply">
            <span class="username">---- {repliedUser}</span>
            <span class="content">{repliedContent}</span>
        </div>
        {/if}
        <div>
            <span class="username">{username}</span>
            <span class="id">({id})</span> - 
            <span class="timestamp">{timestamp}</span>
        </div>
        <div class="content">{content}</div>
    </li>
{/each}
</ul>