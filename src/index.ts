import app from "./app";
import { PORT } from "./config/secrets";

app.listen(PORT, ()=> {
    console.log(`[Server]: I am running at https://localhost:${PORT}`);
});