import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

const prisma = new PrismaClient();

app.use(express.json());

// Run migrations
async function runMigrations() {
  try {
    await execPromise('npx prisma migrate deploy');
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  }
}

// Initialize the application
async function initialize() {
  try {
    await runMigrations();
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize the application:', error);
    process.exit(1);
  }
}

// API Routes
app.post('/api/admin/create', async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUsers = await prisma.user.count();
    if (existingUsers > 0) {
      return res.status(403).json({ error: 'Admin user already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        isAdmin: true,
      },
    });

    res.status(201).json({ message: 'Admin user created successfully', userId: newAdmin.id });
  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({ error: 'Failed to create admin user' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user && await bcrypt.compare(password, user.password)) {
      res.json({ email: user.email, isAdmin: user.isAdmin });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'An error occurred during login' });
  }
});

// ... (add other API routes for claims, etc.)

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Call the initialize function
initialize();