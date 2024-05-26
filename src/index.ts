import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

const options = {
    root: __dirname,
};
app.use('/static', express.static('dist'));
app.get("/", (req: Request, res: Response) => {
    res.sendFile('/index.html', options);
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});


// run with| npx ts-node src/index.ts
// debug with| npm run dev