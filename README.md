# GanitPeak: An AI Math Agent

GanitPeak is an expert math tutor powered by Google Gemini API. It can solve math questions from school to advanced levels, providing step-by-step solutions with clear explanations and LaTeX formatting.

## Features

- Step-by-step math problem solving
- Clear explanations and concept teaching
- LaTeX formatting for mathematical expressions
- Support for text input
- Basic OCR support for image inputs (equations/photos)
- Friendly, educational responses like a human math teacher
- ChatGPT-like web interface
- Video generation for math problem explanations (Under Development)
- Quiz generation
- User authentication and history via Supabase

## Setup

1. Install Python dependencies:
   ```
   pip install -r requirements.txt
   ```

2. For image OCR support (local CLI script `main.py` only), install Tesseract OCR on your system and run `pip install pytesseract`:
   - Windows: Download from [https://github.com/UB-Mannheim/tesseract/wiki](https://github.com/UB-Mannheim/tesseract/wiki)
   - Ensure `tesseract.exe` is in your PATH.

3. Set up Supabase:
   - Create a project on [Supabase](https://supabase.com/).
   - Set up the database tables (`chat_history` and `quiz_history`) to store interactions and scores.

4. Get API keys:
   - Google Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
   - OpenRouter API key from [OpenRouter](https://openrouter.ai/) (used for quiz generation).

5. Create a `.env` file in the root directory with the following variables (copy from `.env.example`):
   ```
   SUPABASE_URL=your_supabase_project_url_here
   SUPABASE_KEY=your_supabase_anon_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   FLASK_DEBUG=True
   ```

6. Install Node.js if not already installed.

7. Install frontend dependencies:
   ```
   cd frontend
   npm install
   ```

## Usage

1. Start the backend server:
   ```
   python app.py
   ```
   The backend will run on http://localhost:5000

2. Start the frontend:
   ```
   cd frontend
   npm start
   ```
   The frontend will run on http://localhost:3000

3. Open http://localhost:3000 in your browser and start chatting with MathGPT!

## Example

Type a math question like "Solve for x: 2x + 3 = 7" and get a step-by-step solution.

## Deployment & Connection (Vercel + Render)

If you are hosting your frontend on Vercel and your backend on Render, they connect over the internet using URLs:

- **Render (Backend)**: Provides a public URL (e.g., `https://your-app.onrender.com`). This runs your database connection and Python/Flask logic.
- **Vercel (Frontend)**: Provides a public URL (e.g., `https://your-app.vercel.app`). This displays your user interface.

### How They Talk to Each Other

1. **Configure Frontend to point to Backend**:
   In your Vercel deployment settings, add the `REACT_APP_API_URL` environment variable:
   - **Key**: `REACT_APP_API_URL`
   - **Value**: `https://your-app.onrender.com` (your deployed Render backend URL)

   *(Note: This is automatically loaded by the frontend in [apiConfig.js](file:///c:/Users/Ganesh/Desktop/GanitPeak-AI-Math-Agent/GanitPeak-AI-Math-Agent-main/GanitPeak-AI-Math-Agent-main/frontend/src/apiConfig.js))*

2. **Configure Backend to allow Frontend (CORS)**:
   In your Render deployment settings, configure the allowed CORS origins using the `ALLOWED_ORIGINS` environment variable:
   - **Key**: `ALLOWED_ORIGINS`
   - **Value**: `https://your-app.vercel.app` (your deployed Vercel frontend URL)

## Note

- For image inputs, ensure the image is clear for accurate OCR.
- The AI verifies solutions with reasoning and never guesses.
- Video generation is currently under development; future support will require Manim and FFmpeg.
