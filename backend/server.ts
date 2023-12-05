import express from 'express';
import multer from 'multer';
import * as apiPackage from './apiPackage';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import createModuleLogger from '../src/logger';

dotenv.config();

const port = process.env.PORT || 3000;

const app = express();
const logger = createModuleLogger('Server');

logger.info('Starting server...');
// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Serve static files from the "Frontend" directory
app.use(express.static('Frontend/dist'));

const storage = multer.memoryStorage(); // Store the file in memory
const upload = multer({ storage: storage });

/*
app.get('/upload-page', (req, res) => {
    // This is just for testing purposes
    res.sendFile(path.join(__dirname, '../Frontend/testwebsite.html'));
});
*/

app.post('/package', upload.single('packageContent'), async (req, res) => {
    try {
        const filteredBody = Object.fromEntries(Object.entries(req.body?.data || {}).filter(([key]) => key !== 'Content'));
        logger.info(`POST /package request: ${JSON.stringify(filteredBody)}`);
        await apiPackage.uploadPackage(req, res);
    } catch (error) {
        logger.info(`Error in post(/package) server.ts: ${error}`);
        res.sendStatus(500);
    }
});

app.post('/packages', async (req, res) => {
    try {
        logger.info(`POST /packages request: ${JSON.stringify(req.body)}`);
        await apiPackage.getPackages(req, res);
    } catch (error) {
        logger.info(`Error in post(/packages) in server.ts: ${error}`);
        res.sendStatus(500);
    }
});

app.delete('/reset', async (req, res) => {
    try {
        logger.info(`DELETE /reset request: ${JSON.stringify(req.body)}`);
        await apiPackage.callResetDatabase(req, res);
    } catch (error) {
        logger.info(`Error in delete(/reset) in server.ts: ${error}`);
        res.sendStatus(500);
    }
});

app.get('/package/byName/:name', async (req, res) => {
    try {
        logger.info(`GET /package/byName/:name request: ${JSON.stringify(req.body)}`);
        await apiPackage.getPackagesByName(req, res);
    } catch (error) {
        logger.info(`Error in get(/packages/byName/:name) in server.ts: ${error}`);
        res.sendStatus(500);
    }
});

app.post('/package/byRegEx', async (req, res) => {
    try {
        logger.info(`POST /package/byRegEx request: ${JSON.stringify(req.body)}`);
        await apiPackage.getPackagesByRegEx(req, res);
    } catch (error) {
        logger.info(`Error in post(/package/byRegEx) in server.ts: ${error}`);
        res.sendStatus(500);
    }
});

app.get('/package/:id', async (req, res) => {
    try {
        logger.info(`GET /package/:id request: ${JSON.stringify(req.body)}`);
        await apiPackage.getPackageDownload(req, res);
    } catch (error) {
        logger.info(`Error in get(/package/:id) in server.ts: ${error}`);
        res.sendStatus(500);
    }
});

app.get('/package/:id/rate', async (req, res) => {
    try {
        logger.info(`GET /package/:id/rate request: ${JSON.stringify(req.body)}`);
        await apiPackage.getPackageRatings(req, res);
    } catch (error) {
        logger.info(`Error in get(/package/:id/rate) in server.ts: ${error}`);
        res.sendStatus(500);
    }
});

app.put('/package/:id', async (req, res) => {
    try {
        const filteredBody = Object.fromEntries(Object.entries(req.body?.data || {}).filter(([key]) => key !== 'Content'));
        logger.info(`PUT /package/:id request: ${JSON.stringify(filteredBody)}`);
        await apiPackage.updatePackage(req, res);
    } catch (error) {
        logger.info(`Error in put(/packages/:id) in server.ts: ${error}`);
        res.sendStatus(500);
    }
});

app.put('/authenticate', (req, res) => {
    res.sendStatus(501)
});

app.use((req, res, next) => {
    if (req.method !== 'GET') {
        res.sendStatus(501);
    } else {
        next();
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../Frontend/dist', 'index.html'));
});

app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
    logger.info(`server started at http://localhost:${port}`);
});