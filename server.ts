import express from 'express';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import mammoth from 'mammoth';

const require = createRequire(import.meta.url);
const pdfModule = require('pdf-parse');
const pdf = typeof pdfModule === 'function' ? pdfModule : (pdfModule.default || pdfModule);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
  });

  // Health check
  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

  // API Routes
  app.post('/api/extract-text', upload.single('resume'), async (req, res) => {
    try {
      console.log(`Extraction requested: ${req.file ? `File: ${req.file.originalname} (${req.file.mimetype})` : 'Plain text'}`);
      
      let text = '';
      if (req.file) {
        const buffer = req.file.buffer;
        const mimetype = req.file.mimetype;

        if (mimetype === 'application/pdf') {
          try {
            console.log('Attempting PDF extraction...');
            // Support both modern pdf-parse (v2+) and classic pdf-parse (v1)
            if (pdfModule && typeof pdfModule.PDFParse === 'function') {
              console.log('Using modern PDFParse class');
              const parser = new pdfModule.PDFParse({ data: buffer });
              const result = await parser.getText();
              text = result.text;
            } else if (typeof pdf === 'function') {
              console.log('Using classic pdf-parse function');
              const data = await pdf(buffer);
              text = data.text;
            } else {
              throw new Error('PDF parsing library not properly initialized or unsupported version');
            }
            console.log(`PDF Extraction successful: ${text.length} chars`);
          } catch (pdfErr: any) {
            console.error('PDF Parse Error:', pdfErr);
            return res.status(422).json({ error: `Failed to parse PDF file: ${pdfErr.message}` });
          }
        } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          try {
            const result = await mammoth.extractRawText({ buffer });
            text = result.value;
          } catch (docxErr: any) {
            console.error('DOCX Parse Error:', docxErr);
            return res.status(422).json({ error: 'Failed to parse DOCX file.' });
          }
        } else {
          text = buffer.toString('utf-8');
        }
      } else if (req.body.text) {
        text = req.body.text;
      }

      if (!text || text.trim().length === 0) {
        return res.status(400).json({ error: 'No readable text content found in the file.' });
      }

      console.log(`Extracted ${text.length} characters.`);
      res.json({ text });
    } catch (error: any) {
      console.error('Extraction error:', error);
      res.status(500).json({ error: `Internal server error during text extraction: ${error.message}` });
    }
  });

  // API 404 handler - prevents SPA fallback for missing API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.originalUrl}` });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
