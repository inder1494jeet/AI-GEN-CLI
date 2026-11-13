import fs from "fs/promises"
import {HOME_DIR,CONFIG_DIR} from "./constant.js"
import path from "path";
import axios from "axios";
import { error } from "console";

//return the content of the setting files (create if it doesnt exist )
export async function getsettingfile()
{
    //ensure the config dir exist 
    try {
        //fs is filesystem
        await fs.access(CONFIG_DIR) //check if config dir is present or not give true or false    
    } catch (error) {
        await fs.mkdir(CONFIG_DIR,{recursive:true});  // if false so we make a config directory 
    }

    const settingfilepath=path.join(CONFIG_DIR,"setting.json");
    try {
        await fs.access(settingfilepath);
        const content=await fs.readFile(settingfilepath,"utf-8")
        return JSON.parse(content)
    } catch (error) {
        await fs.writeFile(settingfilepath,JSON.stringify({}))
        return {};
    }
}

//save apikey to the setting.json file
export async function saveApiKey(apiKey)
{
    const settingfilepath=path.join(CONFIG_DIR,"setting.json")

    const settingcontent =await getsettingfile()
    
    await fs.writeFile(settingfilepath,JSON.stringify({
        ...settingcontent,
        apiKey
    }))
}

//get api key from setting.json file

export async function getapikey()
{
    const setting=await getsettingfile();
    // return setting.apiKey || null;
    const apiKey=setting.apiKey || null
    if(!apiKey)
    {
        return {
            error:"api key not found"
        }
    }

    try {
        const response = await axios.get("https://api.groq.com/openai/v1/models",{
            headers:{
                "Authorization":`Bearer ${apiKey}`
            }
        })
        return {
            apiKey
        }
    } catch (error) {
        
        return {
            error:"Invalid API key"
        }
    }
}