const ai = require("./config/ai"); // your existing ai config

async function listModels() {
    const models = await ai.models.list();
    for await (const model of models) {
        console.log(model.name, "| methods:", model.supportedGenerationMethods);
    }
}

listModels();