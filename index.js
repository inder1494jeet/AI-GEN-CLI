import {ChatGroq} from "@langchain/groq"
import {StateGraph,START,END} from "@langchain/langgraph"
import dotenv from "dotenv"
dotenv.config()

const model =new ChatGroq({
    model:"openai/gpt-oss-120b",
    apiKey:process.env.APIKEY
})

