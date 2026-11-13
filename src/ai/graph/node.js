import {ChatGroq } from "@langchain/groq"
import {getapikey} from "../../utils/file.utils.js"
import {AIMessage, ToolMessage} from "langchain"
import { upsertTool ,readTool,ListTool,DeleteTool} from "../tools/files.tools.js"
import * as fileTools from "../tools/files.tools.js"
import rl from "../../utils/readline.js"

//fileTools comes as object and it has property upserttool
/**
fileTools={
    upsertTool:Tool,
    deleteTool
}
 */

export async function LLMNode(state,config)
{
    // console.log(config.context.username)
    const model =new ChatGroq({
    model:"openai/gpt-oss-120b",
    apiKey:(await getapikey()).apiKey,
})

const modelwithtool=model.bindTools([upsertTool,readTool,ListTool,DeleteTool])

const stream=await modelwithtool.stream(state.messages)

    // console.log(state);
    // return state  // data ko aga forward kero end pe by return 

    // process.stdout.write("AI ")
    let aimessage=null
    for await (const chunk of stream)
    {

        process.stdout.write(chunk.text);
        // aimessage+=chunk.text;
        if(!aimessage) aimessage=chunk
        else aimessage=aimessage.concat(chunk);
        
    }
    process.stdout.write("\n")
    return {
        messages:[
            ...state.messages,
            aimessage
        ]
    }

}

//state of the graph and return update state after handling tool call 
export async function ToolNode(state,config)
{
    const messages=state.messages;
    const lastmessages=state.messages[state.messages.length-1];
    const toolcalls=lastmessages.tool_calls;   //tool_calls is always array and have object in it and all object will tell a tool call

    /**
     * toolcalls=[
     * {
     * name:upsertool,
     * args:{
     * files:[
     * {
     * path:"/index.html",
     * content:<html></html>
     * }
     * ]
     * }
     * }
     * id:"oshfljfdso3r2r3fgj"
     * type:"Tool_call"
     * ]
     */

    /**
fileTools={
    upsertTool:Tool,
    deleteTool
}
 */

    // const toolresults=await Promise.all(
    //     toolcalls.map(async toolcall=>{
    //         return await fileTools[toolcall.name].invoke(toolcall)
    //     })
    // )

    const toolresults=[]

    for (const toolcall of toolcalls)
    {
        switch(toolcall.name)
        {
            case "upsertTool":
                process.stdout.write(`[Tool]:Updating /creating files ${JSON.stringify(toolcall.args.files.map(f=>f.path).join(" ,"))} \n`)
                const userinput=rl.question("Do you want to proceed (YES/NO):")
                if((await userinput).trim().toLowerCase()!=="yes")
                {
                    process.stdout.write("aborting file update \n")
                    return new ToolMessage({
                        content:"User Aborted file updated/created by user",
                        tool_call_id:toolcall.id
                    })
                }
                const result=await fileTools.upsertTool.invoke(toolcall)
                toolresults.push(result)
                break;
            case "readTool":
                process.stdout.write(`[Tool]:Reading files ${JSON.stringify(toolcall.args.files.map(f=>f.path).join(", "))}\n`)
                const readresult=await fileTools.readTool.invoke(toolcall);
                toolresults.push(readresult);
                break;
            case "ListTool":
                process.stdout.write(`[Tool]: Listing files \n`)
                const listresults=await fileTools.ListTool.invoke(toolcall)
                toolresults.push(listresults);
                break;
            case "DeleteTool":
                process.stdout.write(`[Tool]: Deleting files \n`)
                const deleteresult=await fileTools.DeleteTool.invoke(toolcall);
                toolresults.push(deleteresult);
                break;

            default:
                process.stdout.write(`[Unknown Tool] ${toolcall.name}\n`)
                break;
        }
    }
    return {
        messages:[
            ...state.messages,
            ...toolresults

        ]
    }


}