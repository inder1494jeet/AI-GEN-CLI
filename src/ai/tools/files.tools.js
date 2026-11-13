import {tool} from "langchain"
import * as z from "zod"
import fs from "fs/promises"


//create/update file at once multiple (create one if not existed )
export const upsertTool =tool(
    async function ({files}) {
        await Promise.all(files.map(async file=>{
            return await fs.writeFile(file.path,file.content)
        }))
        return "file created successfully"
    },
    {
        name:"upsertTool",
        description:"create/update file at once(create one if not existed)",
        schema:z.object({
            files:z.array(z.object({
                path:z.string().describe("absolute path of the file to be created/updated"),
                content:z.string().describe("content of the file to be created/updated")
            }))
        })
    }
)
export const readTool=tool(
    async function ({files})
    {
        const results=await Promise.all(files.map(async file=>{
            const content =await fs.readFile(file.path,"utf-8")
            return {path:file.path,content}
        }))
        return JSON.stringify(results);
    },
    {
        name:"readTool",
        description:"Read the content of multiple file at once",
        schema:z.object({
            files:z.array(z.object({
                path:z.string().describe("absolute path of the file to be read ")
            }))
        })
    }
)

//list all the folder(recursively) and  file in the current folder(ignore folder like node_modules)
export const ListTool=tool(
    async function ({folder})
    {
        const results=[];
        async function traverse(currentfolder) {
            const entries=await fs.readdir(currentfolder,{withFileTypes:true});
            for(const entry of entries)
            {
                const fullpath=`${currentfolder}/${entry.name}`;
                if(entry.isDirectory())
                {
                    if(entry.name==="node_modules")continue
                    await traverse(fullpath)
                }
                else{
                    results.push(fullpath)
                }
            }
        }
        await traverse(folder)
        return JSON.stringify(results)
    },
    {
        name:"ListTool",
        description:"List all the folder (recursively) and files in the current folder (ignore folder like node_modules)",
        schema:z.object({
            folder:z.string().describe("absolute path  of folder to list")
        })
    }
)
export const DeleteTool=tool(
    async function ({path})
    {
        const stats=await fs.lstat(path);

        if(stats.isDirectory())
        {
            return "Error This directory , not a file"
        }

        await fs.unlink(path);
        return `File deleted successfully ${path}`;
    },
    {
        name:"DeleteTool",
        description:"Delete an existing file using its absolute path",
        schema:z.object({
            path:z.string().describe("Absolute path of the file to delete")
        })
    }
)


// export const deleteTool={}