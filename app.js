import express from 'express'
import { PORT } from './config/env.js'
import { config } from 'dotenv';


const app = express();
app.get('/', (req, res) => {
    res.send('Welcome ')
})

app.listen(PORT, () => {
    console.log(`Subscription tracker is running on http://localhost:${PORT}`)
});

export default app;