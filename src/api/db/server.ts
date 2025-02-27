import express, { response } from 'express';
import cors from 'cors';
import path from 'path';
import { prisma } from './prismaClient';
import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import OpenAI from 'openai';
import { defaultModels } from '../../data/models';
const { VertexAI } = require('@google-cloud/vertexai');
import Anthropic from '@anthropic-ai/sdk';

const project = process.env.GOOGLE_PROJECT;

const location = 'us-central1';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});
const vertexAI = new VertexAI({ project: project, location: location });
const anthropic = new Anthropic();

const bodyParser = require('body-parser');

const app = express();
const PORT = 3003;

const isTestEnabled = () => {
    return process.env.STAGE === 'dev';
};

const testEnabled = isTestEnabled();

if (testEnabled) {
    app.use(cors({ origin: 'http://localhost:8100' }));
}

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

const staticDir = 'build';
app.use(express.static(staticDir));

process.on('SIGINT', async () => {
    console.log('Server wird heruntergefahren...');
    await prisma.$disconnect();
    process.exit(0);
});

async function fetchAndCacheModels() {
    return defaultModels;
}

app.get('/models', async (req, res) => {
    try {
        const allModels = await fetchAndCacheModels();
        res.json(allModels);
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Abrufen der Modelle' });
    }
});

app.get('/userfromxauth', (req, res) => {
    if (testEnabled) {
        return res.json({ email: 'testaccount.testaccount@example.com' });
    }

    const email = req.headers['x-auth-request-email'] || 'guest.guest@example.com';

    // TODO:
    // This application uses internal authentication to identify users.
    // A separate login logic must be implemented here,
    // so that not everyone is logged in as 'guest.guest@example.com'.

    return res.json({ email });
});

app.get('/user/:email', async (req, res) => {
    const { email } = req.params;
    try {
        const user = await prisma.user.findUnique({
            where: { email: email }
        });

        if (!user) {
            return res.status(404).json({ message: 'User nicht gefunden' });
        }

        return res.status(200).json({ user });
    } catch (error) {
        console.error('Fehler beim Abrufen des Users:', error);
        return res.status(500).json({ error: 'Interner Serverfehler' });
    }
});

app.get('/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany();

        return res.status(200).json(users);
    } catch (error) {
        console.error('Fehler beim Abrufen der Nutzerliste:', error);
        return res.status(500).json({ error: 'Interner Serverfehler' });
    }
});

app.post('/user', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email ist erforderlich' });
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email: email }
        });

        if (existingUser) {
            return res.status(200).json({ message: 'User existiert bereits', user: existingUser });
        }

        const newUser = await prisma.user.create({
            data: { email: email }
        });

        return res.status(201).json({ message: 'User erfolgreich erstellt', user: newUser });
    } catch (error) {
        console.error('Fehler beim Erstellen des Users:', error);
        return res.status(500).json({ error: 'Interner Serverfehler' });
    }
});

app.put('/user/:id', async (req, res) => {
    const userId = parseInt(req.params.id, 10);
    const { admin } = req.body;

    if (typeof admin !== 'boolean') {
        return res.status(400).json({ error: '"admin" muss vom Typ boolean sein.' });
    }

    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { admin }
        });

        res.json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Adminstatus aktualisieren fehlgeschlagen.' });
    }
});

function validateRequestBody(requiredFields: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({ error: `${field} ist erforderlich.` });
            }
        }
        next();
    };
}

app.get('/source', async (req: Request, res: Response) => {
    const { id } = req.query;

    try {
        const data = await prisma.source.findMany({
            where: typeof id === 'string' ? { testsetId: parseInt(id, 10) } : {},
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Fehler beim Abrufen der Quellen' });
    }
});

app.post('/source', async (req, res) => {
    const { title, content, testsetId } = req.body;

    if (!content) {
        return res.status(400).json({ error: 'Das Feld "content" ist erforderlich.' });
    }

    try {
        const newSource = await prisma.source.create({
            data: {
                title: title,
                content: content,
                testsetId: testsetId
            }
        });

        res.status(201).json(newSource);
    } catch (error) {
        console.error('Fehler beim Erstellen der Quelle:', error);
        res.status(500).json({ error: 'Fehler beim Erstellen der Quelle.' });
    }
});

app.put('/source', async (req, res) => {
    const { id, title, content } = req.body;

    if (!id || (!title && !content)) {
        return res.status(400).json({ error: 'ID und mindestens ein Feld (title oder content) sind erforderlich.' });
    }

    try {
        const updatedSource = await prisma.source.update({
            where: { id: parseInt(id, 10) },
            data: {
                ...(title && { title }),
                ...(content && { content })
            }
        });

        res.status(200).json({ message: 'Quelle erfolgreich aktualisiert.', updatedSource });
    } catch (error) {
        console.error('Fehler beim Aktualisieren der Quelle:', error);

        if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') {
            return res.status(404).json({ error: 'Quelle nicht gefunden.' });
        }

        res.status(500).json({ error: 'Fehler beim Aktualisieren der Quelle.' });
    }
});

app.delete('/source', async (req, res) => {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'Das Feld "id" ist erforderlich.' });
    }

    try {
        const deletedSource = await prisma.source.delete({
            where: {
                id: parseInt(id as string, 10)
            }
        });

        res.status(200).json({ message: 'Quelle erfolgreich gelöscht.', deletedSource });
    } catch (error) {
        console.error('Fehler beim Löschen der Quelle:', error);

        if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') {
            return res.status(404).json({ error: 'Quelle nicht gefunden.' });
        }

        res.status(500).json({ error: 'Fehler beim Löschen der Quelle.' });
    }
});

app.get('/testset', async (req, res) => {
    const { id } = req.query;

    try {
        const data = await prisma.testset.findMany({
            where: id ? { id: parseInt(id as string, 10) } : undefined,
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                sources: true,
                createdBy: true
            }
        });
        res.json(data);
    } catch (error) {
        console.error('Fehler beim Abrufen der Quellen-Sammlung:', error);
        res.status(500).json({ error: 'Fehler beim Abrufen der Quellen-Sammlung' });
    }
});

app.put('/testset', async (req, res) => {
    const { id, title, description, public: publicAvailable } = req.body;

    if (!id || (!title && !description)) {
        return res.status(400).json({
            error: 'Eine gültige ID und mindestens ein Feld (title, description) sind erforderlich.'
        });
    }

    try {
        const updateData = {
            ...(title && { title }),
            ...(description && { description }),
            ...(publicAvailable !== undefined && { public: publicAvailable })
        };

        const updatedTestset = await prisma.testset.update({
            where: { id: parseInt(id, 10) },
            data: updateData
        });

        res.status(200).json({
            message: 'Quellen-Sammlung erfolgreich aktualisiert.',
            testset: updatedTestset
        });
    } catch (error) {
        console.error('Fehler beim Aktualisieren der Quellen-Sammlung:', error);

        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return res.status(404).json({ error: 'Quellen-Sammlung nicht gefunden.' });
        }

        res.status(500).json({ error: 'Interner Fehler beim Aktualisieren des Quellen-Sammlung.' });
    }
});

app.post('/testset', validateRequestBody(['title', 'description', 'createdById']), async (req, res) => {
    const { title, description, createdById, public: publicAvailable } = req.body;

    try {
        const newTestset = await prisma.testset.create({
            data: {
                title: title,
                ...(description && { description }),
                ...(createdById && { createdById }),
                ...(publicAvailable !== undefined && { public: publicAvailable })
            }
        });

        res.status(201).json(newTestset);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Fehler beim Erstellen der Quellen-Sammlung.' });
    }
});

app.delete('/testset', async (req, res) => {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'Das Feld "id" ist erforderlich.' });
    }

    try {
        await prisma.$transaction(async (prisma) => {
            await prisma.source.deleteMany({
                where: {
                    testsetId: parseInt(id as string, 10)
                }
            });

            await prisma.testset.delete({
                where: {
                    id: parseInt(id as string, 10)
                }
            });
        });

        res.status(200).json({ message: 'Quellen-Sammlung und zugehörige Quellen erfolgreich gelöscht.' });
    } catch (error) {
        console.error('Fehler beim Löschen der Quellen-Sammlung:', error);

        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return res.status(404).json({ error: 'Quellen-Sammlung nicht gefunden.' });
        }

        res.status(500).json({ error: 'Fehler beim Löschen der Quellen-Sammlung.' });
    }
});

app.get('/annotationlist', async (req: Request, res: Response) => {
    const id = req.query.id as string | undefined;
    const title = req.query.title as string | undefined;
    const testset = req.query.testset as string | undefined;

    try {
        const where: any = {};

        if (id) {
            const parsedId = parseInt(id, 10);
            if (isNaN(parsedId)) {
                return res.status(400).json({ error: 'Ungültige ID' });
            }
            where.id = parsedId;
        }

        if (title) {
            where.title = {
                contains: title,
                mode: 'insensitive'
            };
        }

        if (testset) {
            where.testset = testset;
        }

        const annotationLists = await prisma.annotationList.findMany({
            where,
            include: {
                prompts: true,
                generatedOutput: {
                    include: {
                        version: true,
                        feedbacks: true
                    }
                },
                createdBy: true
            },
            orderBy: [{ createdAt: 'desc' }]
        });

        res.json(annotationLists);
    } catch (error) {
        console.error('Fehler beim Abrufen der AnnotationLists:', error);
        res.status(500).json({ error: 'Interner Serverfehler' });
    }
});

app.get('/annotationlist/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Ungültige ID' });
    }
    try {
        const annotationList = await prisma.annotationList.findUnique({
            where: { id },
            include: {
                prompts: true,
                generatedOutput: {
                    include: {
                        feedbacks: true,
                        logs: {
                            orderBy: {
                                id: 'asc'
                            }
                        }
                    }
                },
                createdBy: true
            }
        });

        if (!annotationList) {
            return res.status(404).json({ error: 'Nicht gefunden' });
        }

        res.json(annotationList);
    } catch (error) {
        console.error('Fehler beim Abrufen der AnnotationList:', error);
        res.status(500).json({ error: 'Interner Serverfehler' });
    }
});

app.put('/annotationlist', async (req: Request, res: Response) => {
    const id = req.query.id as string | undefined;
    const { title, description, testset, promptIds, testsetName, public: publicAvailable } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'Der Query-Parameter "id" ist erforderlich' });
    }

    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
        return res.status(400).json({ error: 'Ungültige ID' });
    }

    if (promptIds && !Array.isArray(promptIds)) {
        return res.status(400).json({ error: 'promptIds muss ein Array von Zahlen sein.' });
    }

    try {
        const data: any = {
            ...(title !== undefined && { title }),
            ...(description !== undefined && { description }),
            ...(testset !== undefined && { testset }),
            ...(testsetName !== undefined && { testsetName }),
            ...(publicAvailable !== undefined && { public: publicAvailable })
        };

        if (promptIds) {
            data.prompts = {
                set: promptIds.map((id: number) => ({ versionId: id }))
            };
        }

        const updatedAnnotationList = await prisma.annotationList.update({
            where: { id: parsedId },
            data,
            include: {
                prompts: true
            }
        });

        res.json(updatedAnnotationList);
    } catch (error) {
        console.error('Fehler beim Aktualisieren der AnnotationList:', error);
        res.status(500).json({ error: 'Interner Serverfehler' });
    }
});

app.post('/annotationlist', async (req: Request, res: Response) => {
    const { title, description, testset, prompts, testsetName, runs, createdById, public: publicAvailable } = req.body;

    if (!title || typeof title !== 'string') {
        return res.status(400).json({ error: 'Das Feld "title" ist erforderlich und muss ein String sein.' });
    }

    if (!testset || !Array.isArray(testset) || !testset.every((item) => typeof item === 'string')) {
        return res
            .status(400)
            .json({ error: 'Das Feld "testset" ist erforderlich und muss ein Array von Strings sein.' });
    }

    if (!prompts || !Array.isArray(prompts) || !prompts.every((prompt) => typeof prompt.versionId === 'number')) {
        return res
            .status(400)
            .json({ error: 'Das Feld "prompts" ist erforderlich und muss ein Array von Objekten sein.' });
    }

    if (!createdById || typeof createdById !== 'number') {
        return res.status(400).json({ error: 'Das Feld "createdById" ist erforderlich und muss vom Typ number sein.' });
    }

    try {
        const data: any = {
            title,
            description,
            testset,
            testsetName,
            runs,
            prompts: {
                connect: prompts.map((prompt) => ({ versionId: prompt.versionId }))
            },
            createdById,
            public: publicAvailable
        };

        const newAnnotationList = await prisma.annotationList.create({
            data,
            include: {
                prompts: true
            }
        });

        res.status(201).json(newAnnotationList);
    } catch (error) {
        console.error('Fehler beim Erstellen der AnnotationList:', error);
        res.status(500).json({ error: 'Interner Serverfehler' });
    }
});

app.delete('/annotationlist/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
        return res.status(400).json({ error: 'Ungültige ID' });
    }

    try {
        const annotationList = await prisma.annotationList.findUnique({
            where: { id },
            include: {
                generatedOutput: {
                    include: {
                        feedbacks: true
                    }
                }
            }
        });

        if (!annotationList) {
            return res.status(404).json({ error: 'AnnotationList nicht gefunden' });
        }

        const feedbackIds = annotationList.generatedOutput.flatMap((output) =>
            output.feedbacks.map((feedback) => feedback.id)
        );

        if (feedbackIds.length > 0) {
            await prisma.feedback.deleteMany({
                where: {
                    id: {
                        in: feedbackIds
                    }
                }
            });
        }

        const generatedOutputIds = annotationList.generatedOutput.map((output) => output.id);

        if (generatedOutputIds.length > 0) {
            await prisma.generatedOutput.deleteMany({
                where: {
                    id: {
                        in: generatedOutputIds
                    }
                }
            });
        }

        await prisma.annotationList.delete({
            where: { id }
        });

        res.status(200).json({ message: 'AnnotationList erfolgreich gelöscht' });
    } catch (error) {
        console.error('Fehler beim Löschen der AnnotationList:', error);
        res.status(500).json({ error: 'Interner Serverfehler' });
    }
});

app.get('/prompt', async (req, res) => {
    const { id } = req.query;

    try {
        const data = await prisma.prompt.findMany({
            where: id ? { versionId: parseInt(id as string, 10) } : undefined,
            orderBy: [{ createdAt: 'desc' }],
            include: {
                createdBy: true
            }
        });
        res.json(data);
    } catch (error) {
        console.error('Fehler beim Abrufen der Prompts:', error);
        res.status(500).json({ error: 'Fehler beim Abrufen der Prompts' });
    }
});

app.post('/prompt', async (req, res) => {
    const { title, promptId, content, description, model, variance, createdById, public: publicAvailable } = req.body;

    if (!title || !content || !model || !createdById || variance === undefined) {
        return res.status(400).json({
            error: 'Die Felder "title", "content", "model", "platform", "createdById" und "variance" sind erforderlich.'
        });
    }

    if (!Number.isInteger(variance)) {
        return res.status(400).json({ error: 'Das Feld "variance" muss eine ganze Zahl sein.' });
    }

    if (typeof content !== 'string') {
        return res.status(400).json({ error: 'Das Feld "content" muss ein String sein.' });
    }

    try {
        const newPrompt = await prisma.prompt.create({
            data: {
                title,
                promptId,
                content,
                description,
                model,
                variance,
                ...(createdById && { createdById }),
                public: publicAvailable
            },
            include: {
                createdBy: true
            }
        });

        res.status(201).json(newPrompt);
    } catch (error) {
        console.error('Fehler beim Erstellen des Prompts:', error);
        res.status(500).json({ error: 'Fehler beim Erstellen des Prompts.' });
    }
});

app.put('/prompt/:id', async (req, res) => {
    const promptId = parseInt(req.params.id, 10);
    if (isNaN(promptId)) {
        return res.status(400).json({ error: 'Ungültige ID' });
    }

    const { public: publicAvailable } = req.body;

    try {
        const updated = await prisma.prompt.update({
            where: { versionId: promptId },
            data: {
                ...(publicAvailable !== undefined && { public: publicAvailable })
            }
        });

        res.json(updated);
    } catch (error) {
        console.error('Fehler beim Aktualisieren des Prompts:', error);
        res.status(500).json({ error: 'Fehler beim Aktualisieren des Prompts' });
    }
});

app.delete('/prompt/:id', async (req, res) => {
    const promptId = parseInt(req.params.id, 10);

    if (isNaN(promptId)) {
        return res.status(400).json({ error: 'Ungültige ID' });
    }

    try {
        const hasDependencies =
            (await prisma.generatedOutput.findFirst({
                where: { versionId: promptId }
            })) ||
            (await prisma.annotationList.findFirst({
                where: { prompts: { some: { versionId: promptId } } }
            }));

        if (hasDependencies) {
            return res.status(400).json({
                error: 'Der Prompt kann nicht gelöscht werden, da zugehörige Test-Einträge existieren.'
            });
        }

        const deletedPrompt = await prisma.prompt.delete({
            where: { versionId: promptId }
        });

        res.status(200).json({
            message: 'Prompt erfolgreich gelöscht.',
            deletedPrompt
        });
    } catch (error) {
        console.error('Fehler beim Löschen des Prompts:', error);

        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return res.status(404).json({ error: 'Prompt nicht gefunden.' });
        }

        res.status(500).json({ error: 'Fehler beim Löschen des Prompts.' });
    }
});

app.get('/generatedOutput', async (req, res) => {
    const { id } = req.query;

    try {
        const data = await prisma.generatedOutput.findMany({
            where: id ? { annotationListId: parseInt(id as string, 10) } : {},
            include: {
                feedbacks: true,
                logs: {
                    orderBy: {
                        id: 'asc'
                    }
                }
            }
        });
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Fehler beim Abrufen des generierten Outputs' });
    }
});

app.post(
    '/generatedOutput',
    validateRequestBody(['content', 'source', 'versionId', 'annotationListId']),
    async (req, res) => {
        const { content, source, versionId, annotationListId, logs } = req.body;

        const parsedVersionId = parseInt(versionId, 10);
        const parsedAnnotationListId = parseInt(annotationListId, 10);

        if (isNaN(parsedVersionId) || isNaN(parsedAnnotationListId)) {
            return res.status(400).json({
                error: 'Die Felder "versionId" und "annotationListId" müssen gültige IDs sein.'
            });
        }

        try {
            const newGeneratedOutput = await prisma.generatedOutput.create({
                data: {
                    content,
                    source,
                    version: { connect: { versionId: parsedVersionId } },
                    annotationList: { connect: { id: parsedAnnotationListId } }
                }
            });

            if (logs && Array.isArray(logs) && logs.length > 0) {
                await prisma.log.createMany({
                    data: logs.map((log) => ({
                        msg: log.msg,
                        status: log.status,
                        start: log.start ?? null,
                        end: log.end ?? null,
                        attempt: log.attempt ?? null,
                        generatedOutputId: newGeneratedOutput.id,
                        response: log.response ?? null,
                        call: log.call ?? null
                    }))
                });
            }

            res.status(201).json(newGeneratedOutput);
        } catch (error) {
            console.error('Fehler beim Erstellen des generierten Outputs:', error);
            res.status(500).json({ error: 'Fehler beim Erstellen des generierten Outputs.' });
        }
    }
);

app.get('/feedback', async (req, res) => {
    const { id } = req.query;

    try {
        const data = await prisma.feedback.findMany({
            where: id ? { generatedOutputId: parseInt(id as string, 10) } : {}
        });
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Fehler beim Abrufen des Feedbacks' });
    }
});

app.post('/feedback', validateRequestBody(['userId', 'generatedOutputId']), async (req, res) => {
    const { reviewEffortScale, feedbackTextPositive, feedbackTextNegative, userId, generatedOutputId } = req.body;

    const parsedUserId = parseInt(userId, 10);
    const parsedGeneratedOutputId = parseInt(generatedOutputId, 10);

    if (isNaN(parsedUserId) || isNaN(parsedGeneratedOutputId)) {
        return res.status(400).json({ error: 'Die Felder "userId" und "generatedOutputId" müssen gültige IDs sein.' });
    }

    try {
        const newFeedback = await prisma.feedback.create({
            data: {
                reviewEffortScale: reviewEffortScale,
                feedbackTextPositive: feedbackTextPositive || null,
                feedbackTextNegative: feedbackTextNegative || null,
                userId: parsedUserId,
                generatedOutputId: parsedGeneratedOutputId
            }
        });

        res.status(201).json(newFeedback);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Fehler beim Erstellen des Feedbacks.' });
    }
});

app.put('/feedback/:id', async (req, res) => {
    const { id } = req.params;
    const { reviewEffortScale, feedbackText, feedbackTextPositive, feedbackTextNegative } = req.body;

    try {
        const updatedFeedback = await prisma.feedback.update({
            where: { id: parseInt(id, 10) },
            data: {
                reviewEffortScale: reviewEffortScale || undefined,
                feedbackTextPositive: feedbackTextPositive !== undefined ? feedbackTextPositive : undefined,
                feedbackTextNegative: feedbackTextNegative !== undefined ? feedbackTextNegative : undefined
            }
        });

        res.json(updatedFeedback);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Fehler beim Aktualisieren des Feedbacks.' });
    }
});

app.post('/generate', async (req, res) => {
    const { model, prompt, variance, source } = req.body;

    if (!model || !prompt || !source || !variance) {
        return res.status(400).json({ error: 'Model, prompt, variance und source werden benötigt.' });
    }

    const allModels = await fetchAndCacheModels();
    console.log(allModels);
    const selectedModel = allModels.find((m) => m.value === model);

    if (!selectedModel) {
        return res.status(400).json({ error: 'Ungültiges Modell ausgewählt.' });
    }

    const platform = selectedModel.platform;

    try {
        let response;

        if (platform === 'openai') {
            response = await generateWithOpenAI(model, prompt, variance, source);
        } else if (platform === 'google') {
            response = await generateWithGoogle(model, prompt, variance, source);
        } else if (platform === 'ailab') {
            response = await generateWithAiLabModel(model, prompt, variance, source);
        } else if (platform === 'anthropic') {
            response = await generateWithAnthropicModel(model, prompt, variance, source);
        } else {
            return res.status(400).json({ error: 'Ungültige Plattform ausgewählt.' });
        }

        return res.status(200).json(response);
    } catch (error) {
        console.error('Fehler beim Generieren des Inhalts:', error);
        res.status(500).json({ error: 'Fehlgeschlagen den Inhalt zu generieren.' });
    }
});

async function generateWithOpenAI(model: string, prompt: string, variance: number, source: string) {
    const response = await openai.chat.completions.create({
        model,
        temperature: variance * 0.2,
        messages: [
            { role: 'user', content: prompt },
            { role: 'user', content: source }
        ]
    });

    return response.choices[0]?.message?.content || '';
}

async function generateWithAiLabModel(model: string, prompt: string, variance: number, source: string) {
    // for DEBUG
    // const baseURL = `https://aiditor-as-a-agent.brdata-dev.de/exceptions/retry_exception`;
    const baseURL = `${process.env.AILAB_MODEL_BASE_URL}openai/deployments/${model}/chat/completions`;

    try {
        const response = await fetch(baseURL, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.AILAB_MODEL_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                debug: true,
                messages: [
                    { role: 'user', content: prompt },
                    { role: 'user', content: source }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`Fehler: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();

        let responseObject = {
            response: data.choices[0]?.message?.content || '',
            debug: data.debug || []
        };
        return responseObject;
    } catch (error) {
        console.error('Fehler beim Generieren der Antwort:', error);
        throw error;
    }
}

async function generateWithAnthropicModel(model: string, prompt: string, variance: number, source: string) {
    const response = await anthropic.messages.create({
        model,
        max_tokens: 5000,
        temperature: variance * 0.2,
        messages: [
            { role: 'user', content: prompt },
            { role: 'user', content: source }
        ]
    });

    const firstContent = response.content?.[0];
    if (firstContent && 'text' in firstContent) {
        return firstContent.text;
    } else {
        return '';
    }
}

interface Part {
    text: string;
}

async function generateWithGoogle(modelId: string, prompt: string, variance: number, source: string) {
    const generativeModel = vertexAI.getGenerativeModel({
        model: modelId,
        generationConfig: { temperature: variance * 0.2 }
    });

    const request = {
        contents: [
            { role: 'user', parts: [{ text: prompt }] },
            { role: 'user', parts: [{ text: source }] }
        ]
    };
    const result = await generativeModel.generateContent(request);
    const response = result.response;

    const parts: Part[] | undefined = response?.candidates?.[0]?.content?.parts;

    const text = parts?.map((part: Part) => part.text)?.join('\n\n') || '';

    return text;
}

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../build', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server läuft auf ${PORT}`);
});
