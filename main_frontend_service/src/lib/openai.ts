import OpenAI from "openai";


const client = new OpenAI({
    apiKey: process.env.OPENAI_KEY,
  });

  
  
  export{client}