import { getsettingfile,saveApiKey,getapikey } from "./utils/file.utils.js";
import rl from "./utils/readline.js";
// import initgraph from "./ai/graph/graph.js";
import initgraph from "./ai/graph/graph.js";
async function main()
{
    const setting= await getsettingfile();
    // console.log(setting);
    if(!setting.apiKey)
    {
      const apiKey=await rl.question("Plz enter api key: ")
     await saveApiKey(apiKey)
    }
    const response=await getapikey();
    // console.log(response)
    if(response.error)
    {
        console.error("invalid or expire api key")
        const apiKey= await rl.question("plz enter api key : ")
        await saveApiKey(apiKey);
        return main()
    }
    // console.log(apikey)
    // const apiKey=response.apiKey

    await initgraph()

    rl.close()
}
export default main;