import dotenv from "dotenv";
dotenv.config({path: './config.env'});

import db from "./config/dbConfig.js";
import server from "./app.js";


const port = process.env.PORT_NUMBER || 5000;

server.listen(port, () => {
    console.log('Listening to requests on PORT: ' + port);
});