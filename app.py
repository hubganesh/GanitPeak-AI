from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import google.generativeai as genai
from dotenv import load_dotenv
from PIL import Image
import io
import base64
import os
from datetime import datetime, timedelta
import uuid
import hashlib
import re

from supabase import create_client, Client

# File upload security configuration
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

def validate_file_upload(file):
    """Validate file upload for security."""
    if not file or file.filename == '':
        return None, 'No file provided'
    
    # Check file size
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0)
    
    if file_size > MAX_FILE_SIZE:
        return None, f'File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB'
    
    # Check file extension
    file_ext = file.filename.lower().rsplit('.', 1)[-1] if '.' in file.filename else ''
    if file_ext not in ALLOWED_EXTENSIONS:
        return None, f'Invalid file type. Allowed types: {", ".join(ALLOWED_EXTENSIONS)}'
    
    return file, None

def sanitize_input(input_string, max_length=1000):
    """Sanitize user input to prevent injection attacks."""
    if not input_string:
        return None
    
    # Remove potentially dangerous characters
    sanitized = re.sub(r'[<>"\']', '', str(input_string))
    
    # Limit length
    return sanitized[:max_length].strip()

app = Flask(__name__, static_folder='../frontend/build', static_url_path='/')

# Configure rate limiting
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

# Configure CORS for production - restrict to specific domains
allowed_origins = os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000').split(',')
CORS(app, resources={r"/*": {"origins": allowed_origins}})

@app.before_request
def log_request_info():
    # print headers and path for debugging fetch issues
    print(f"Incoming {request.method} request to {request.path}")

@app.after_request
def add_security_headers(response):
    # Security headers
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
    return response

@app.route('/')
def home():
    return jsonify({
        "status": "online",
        "message": "MathVerse AI Math Agent API is running successfully!"
    }), 200

load_dotenv()  # Load environment variables from .env file

# Supabase Configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_supabase_user(req):
    """Helper to verify Supabase token and return user ID."""
    auth_header = req.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    
    token = auth_header.split(' ')[1]
    try:
        response = supabase.auth.get_user(token)
        if response.user:
            return response.user
    except:
        pass
    return None

print(f"Connected to Supabase at {SUPABASE_URL}")

# Tables are managed by Supabase

# Load API keys from environment
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY')

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable is not set")

if not OPENROUTER_API_KEY:
    raise ValueError("OPENROUTER_API_KEY environment variable is not set")

# Configure the API
genai.configure(api_key=GEMINI_API_KEY)

# Choose the model with vision capabilities
model = genai.GenerativeModel('gemini-3-flash-preview')

# OpenRouter Configuration
OPENROUTER_MODEL = 'openai/gpt-4o-mini'

LANG_NAMES = {
    'en': 'English',
    'hi': 'Hindi',
    'kn': 'Kannada'
}

def openrouter_generate_quiz(prompt):
    """Generate quiz using OpenRouter API."""
    import requests
    import json
    
    headers = {
        'Authorization': f'Bearer {OPENROUTER_API_KEY}',
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'MathVerse Quiz Generator'
    }
    
    data = {
        'model': OPENROUTER_MODEL,
        'messages': [
            {'role': 'system', 'content': 'You are a professional quiz generator. Return only valid JSON.'},
            {'role': 'user', 'content': prompt}
        ],
        'temperature': 0.7,
        'response_format': { 'type': 'json_object' }
    }
    
    try:
        response = requests.post(
            'https://openrouter.ai/api/v1/chat/completions',
            headers=headers,
            json=data,
            timeout=30  # Reduce timeout to give Gemini a chance if slow
        )
        
        if response.status_code == 200:
            result = response.json()
            content = result['choices'][0]['message']['content']
            return content
        else:
            print(f"OpenRouter Error: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"OpenRouter Exception: {str(e)}")
        return None

def solve_math_question(question=None, image=None, subject='MathGPT', language='en'):
    """
    Solve a math/physics/chemistry/accounting question using Google Gemini API, optionally with an image.
    """
    
    # Define prompts for different subjects
    prompts = {
        'MathGPT': """
You are Mathverse, an expert math tutor. Solve the following math question step-by-step with clear explanations and LaTeX formatting for mathematical expressions.
Provide concise and straightforward responses. For simple problems, give direct answers without unnecessary elaboration. For more complex problems, explain the concept briefly.
Respond clearly, friendly, and educationally—like a human math teacher. When uncertain, verify with reasoning or basic computation; never guess.

Question: {question}

Solution:
""",
        'PhysicsGPT': """
You are PhysicsVerse, an expert physics tutor. Solve the following physics question step-by-step with clear explanations and proper scientific notation.
Use appropriate units, formulas, and diagrams when helpful. Explain concepts clearly and relate them to real-world applications.
Provide concise yet comprehensive solutions. When dealing with calculations, show all work and units clearly.

Question: {question}

Solution:
""",
        'ChemGPT': """
You are ChemVerse, an expert chemistry tutor. Solve the following chemistry question step-by-step with clear explanations and proper chemical notation.
Use correct molecular formulas, balanced equations, and IUPAC nomenclature. Explain reaction mechanisms and principles clearly.
Provide detailed yet concise solutions with proper units and significant figures.

Question: {question}

Solution:
""",
        'AccountingGPT': """
You are AccountingVerse, an expert accounting tutor. Solve the following accounting question step-by-step with clear explanations.
Use proper accounting terminology, principles (GAAP/IFRS), and journal entry formats. Show calculations clearly and explain the reasoning behind each entry.
Provide practical examples and relate concepts to real business scenarios when applicable.

Question: {question}

Solution:
"""
    }
    
    # Add language instruction
    lang_name = LANG_NAMES.get(language, 'English')
    
    prompt = prompts.get(subject, prompts['MathGPT'])
    prompt += f"\nIMPORTANT: You MUST respond in {lang_name}."
    
    if image:
        # Use Gemini Vision
        response = model.generate_content([prompt.format(question=question or "Solve the problem in this image"), image])
    else:
        # Text-only
        response = model.generate_content(prompt.format(question=question))
    
    return response.text

def voice_math_processing(transcript, language='en'):
    """
    Process voice transcript using Gemini to normalize it into a math expression.
    """
    prompt = f"""
Transcript: "{transcript}"

You are a math normalization + reasoning assistant. 
Convert the transcript into a sanitized, machine-parseable math expression. 
Map conversational tokens to math: "plus"→"+", "minus"→"-", "times/multiplied by/into/x"→"*", "divided by/over"→"/", "open parenthesis"→"(", "close parenthesis"→")", "point"→".", "squared"→"^2", "cubed"→"^3", "to the power of/power of"→"^", "square root of"/"sqrt"→"sqrt()", trig functions names → sin(), cos(), etc. Also convert numbers spoken in words to digits ("one hundred twenty three"→"123"), and fractions ("one half"→"1/2").

If the transcript is in Hindi or Kannada, map those terms accordingly (e.g., "जमा" or "ಕೂಡಿಸು" to "+").
Return strictly JSON (no commentary) with these fields:
{{
  "normalizedExpression":"...", 
  "displayLatex":"...", 
  "intent":"evaluate|solve|simplify|differentiate|integrate|unknown", 
  "result":"...", 
  "steps":[ "...", "..."], 
  "confidence":0.0, 
  "clarifications":[], 
  "error":null
}}

Examples:
- "two plus two" => normalizedExpression: "2 + 2", result: "4"
- "open parenthesis three plus five close parenthesis times seven" => "(3 + 5) * 7"
- "solve x squared minus four equals zero" => "x^2 - 4 = 0", intent: "solve", result: "x = -2, 2"

If ambiguous or unparseable, set "error" with a brief message and provide helpful "clarifications".
"""

    try:
        response = model.generate_content(prompt)
        result_text = response.text.strip()
        
        # Try to parse JSON
        import json
        import re
        # Find JSON in the response
        json_match = re.search(r'\{.*\}', result_text, re.DOTALL)
        if json_match:
            parsed = json.loads(json_match.group())
            return parsed
        else:
            return {"error": "No JSON found in Gemini response", "raw_response": result_text}
    except Exception as e:
        return {"error": str(e), "raw_response": result_text if 'result_text' in locals() else None}

@app.route('/voice_math', methods=['POST'])
def voice_math():
    data = request.get_json()
    transcript = data.get('transcript', '')
    language = data.get('language', 'en')
    
    if not transcript:
        return jsonify({'error': 'No transcript provided'}), 400
    
    # Check for authentication token
    user = get_supabase_user(request)
    user_id = user.id if user else None
    
    try:
        result = voice_math_processing(transcript, language)
        
        # Save to chat history if successful
        if 'error' not in result:
            chat_data = {
                "user_id": user_id,
                "question": f"Voice: {transcript}",
                "answer": result.get('normalizedExpression', ''),
                "image_data": None
            }
            supabase.table("chat_history").insert(chat_data).execute()
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password') or not data.get('name'):
        return jsonify({'message': 'Name, email, and password are required'}), 400
    
    try:
        # Use Supabase Auth for registration
        response = supabase.auth.sign_up({
            "email": data['email'],
            "password": data['password'],
            "options": {
                "data": {
                    "full_name": data['name']
                }
            }
        })
        
        if response.user:
            return jsonify({
                'message': 'User registered successfully. Please check your email for verification.',
                'user_id': response.user.id
            }), 201
        else:
            return jsonify({'message': 'Registration failed'}), 400
            
    except Exception as e:
        return jsonify({'message': 'Registration failed', 'error': str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Email and password are required'}), 400
    
    try:
        # Sign in with Supabase Auth
        response = supabase.auth.sign_in_with_password({
            "email": data['email'],
            "password": data['password']
        })
        
        if not response.user:
            return jsonify({'message': 'Invalid email or password'}), 401
        
        return jsonify({
            'message': 'Login successful',
            'access_token': response.session.access_token,
            'refresh_token': response.session.refresh_token,
            'user_id': response.user.id,
            'name': response.user.user_metadata.get('full_name'),
            'email': response.user.email
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/solve', methods=['POST'])
def solve():
    question = None
    image = None
    image_data = None
    subject = request.form.get('subject', 'MathGPT')
    language = request.form.get('language', 'en')
    
    # Check for authentication token
    user = get_supabase_user(request)
    user_id = user.id if user else None
    
    if 'file' in request.files:
        file = request.files['file']
        if file.filename != '':
            # Validate file upload
            validated_file, error = validate_file_upload(file)
            if error:
                return jsonify({'error': error}), 400
            
            # Read image file and convert to base64 for storage
            image_data_bytes = validated_file.read()
            image_data = base64.b64encode(image_data_bytes).decode('utf-8')
            image = Image.open(io.BytesIO(image_data_bytes))
    
    question = sanitize_input(request.form.get('question', ''))
    
    if not question and not image:
        return jsonify({'error': 'No question or image provided'}), 400
    
    try:
        answer = solve_math_question(question=question, image=image, subject=subject, language=language)
        
        # Save to Supabase
        chat_data = {
            "user_id": user_id,
            "question": question or 'Image question',
            "answer": answer,
            "image_data": image_data
        }
        response = supabase.table("chat_history").insert(chat_data).execute()
        chat_id = response.data[0]['id'] if response.data else None
        
        return jsonify({'answer': answer, 'chat_id': chat_id})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/chat_history', methods=['GET'])
def get_chat_history():
    try:
        # Check for authentication
        user = get_supabase_user(request)
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        user_id = user.id
        
        # Get chat history - user-specific only
        query = supabase.table("chat_history").select("*").order("timestamp", desc=True).limit(10)
        query = query.eq("user_id", user_id)
        
        response = query.execute()
        return jsonify({'chats': response.data})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/chat_history/<int:chat_id>', methods=['GET'])
def get_single_chat(chat_id):
    try:
        # Check for authentication
        user = get_supabase_user(request)
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        response = supabase.table("chat_history").select("*").eq("id", chat_id).single().execute()
        
        # Verify user owns this chat
        if response.data and response.data.get('user_id') != user.id:
            return jsonify({'error': 'Unauthorized access'}), 403
        
        return jsonify(response.data)
    except Exception as e:
        return jsonify({'error': str(e)}), 404

@app.route('/chat_history/<int:chat_id>', methods=['DELETE'])
def delete_single_chat(chat_id):
    try:
        # Check for authentication
        user = get_supabase_user(request)
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        # Verify user owns this chat before deleting
        response = supabase.table("chat_history").select("*").eq("id", chat_id).single().execute()
        if response.data and response.data.get('user_id') != user.id:
            return jsonify({'error': 'Unauthorized access'}), 403
        
        supabase.table("chat_history").delete().eq("id", chat_id).execute()
        return jsonify({'message': 'Chat deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/quiz_history', methods=['POST'])
def save_quiz_history():
    data = request.get_json()
    try:
        user = get_supabase_user(request)
        user_id = user.id if user else None
        
        response = supabase.table("quiz_history").insert({
            "user_id": user_id,
            "subject": data['subject'],
            "topic": data['topic'],
            "score": data['score'],
            "total": data['total'],
            "percentage": data['percentage']
        }).execute()
        return jsonify({'message': 'Quiz history saved', 'id': response.data[0]['id'] if response.data else None}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/quiz_history', methods=['GET'])
def get_quiz_history():
    try:
        # Check for authentication
        user = get_supabase_user(request)
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        user_id = user.id
        
        query = supabase.table("quiz_history").select("*").order("timestamp", desc=True)
        query = query.eq("user_id", user_id)
            
        response = query.execute()
        return jsonify({'quizzes': response.data})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/quiz_history/<int:quiz_id>', methods=['DELETE'])
def delete_quiz_history(quiz_id):
    try:
        # Check for authentication
        user = get_supabase_user(request)
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        
        # Verify user owns this quiz before deleting
        response = supabase.table("quiz_history").select("*").eq("id", quiz_id).single().execute()
        if response.data and response.data.get('user_id') != user.id:
            return jsonify({'error': 'Unauthorized access'}), 403
        
        supabase.table("quiz_history").delete().eq("id", quiz_id).execute()
        return jsonify({'message': 'Quiz history deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/generate_quiz', methods=['POST'])
def generate_quiz():
    data = request.form
    subject = sanitize_input(data.get('subject', 'Mathematics'))
    topic = sanitize_input(data.get('topic', ''))
    difficulty = sanitize_input(data.get('difficulty', 'medium'))
    num_questions = int(data.get('num_questions', 10))
    question_types = sanitize_input(data.get('question_types', 'mixed'))
    subtopics = data.getlist('subtopics[]') or data.getlist('subtopics')
    language = sanitize_input(data.get('language', 'en'))

    file = request.files.get('file')
    extracted_text = ''
    if file:
        # Validate file upload
        validated_file, error = validate_file_upload(file)
        if error:
            return jsonify({'error': error}), 400
        
        if validated_file.filename.endswith('.pdf'):
            import fitz  # PyMuPDF
            doc = fitz.open(stream=validated_file.read(), filetype='pdf')
            for page in doc:
                extracted_text += page.get_text()
        else:
            # Assume image
            image = Image.open(validated_file)
            # Use Gemini for OCR
            vision_model = genai.GenerativeModel('gemini-3-pro-preview')  # Assuming vision model
            response = vision_model.generate_content(["Extract text from this image", image])
            extracted_text = response.text

        # Use extracted text to determine topic if not provided
        if not topic:
            topic_prompt = f"Extract the main topic from this text: {extracted_text[:500]}"
            topic_response = model.generate_content(topic_prompt)
            topic = topic_response.text.strip()

    prompt = f"""
You are an AI Interactive Quiz Generator for {subject} students.
Generate a comprehensive quiz with EXACTLY {max(10, num_questions)} questions on the topic "{topic}" at {difficulty} difficulty.
Question types to include: {question_types}.
Subtopics to cover: {', '.join(subtopics) if subtopics else 'Cover all core concepts related to ' + topic}.

IMPORTANT: The ENTIRE quiz (questions, options, explanations, hints) MUST be in {LANG_NAMES.get(language, 'English')}.

EACH and EVERY mathematical expression, equation, number with symbol, variable, or fraction MUST be enclosed in LaTeX notation using single dollar signs for inline (e.g., $x^2 + 2x + 1 = 0$) or double dollar signs for blocks. 
Example: "What is the derivative of $x^2$?" not "What is the derivative of x^2?".
Example: "Solve for $x$: $2x + 3 = 7$"

Each question must:
1. Test a specific concept clearly (tag it in 'concept').
2. Include 4 options for multiple choice.
3. Provide a clear, educational explanation using LaTeX for all math.
4. Provide a helpful hint using LaTeX for all math.
5. Cover at least 3-4 different concepts within the topic.

Return ONLY a JSON object with this structure:
{{
  "questions": [
    {{
      "text": "Question text with $LaTeX$",
      "type": "multiple_choice|fill_in|true_false",
      "options": ["Option A with $math$", "Option B", "Option C", "Option D"],
      "correct_answer": "Exact string of correct option",
      "concept": "Concept Name",
      "explanation": "Detailed explanation with $LaTeX$",
      "hint": "Hint with $LaTeX$"
    }}
  ]
}}
"""

    quiz_text = "No response"
    try:
        # Try OpenRouter first as requested
        print(f"Generating quiz for {topic} using OpenRouter...")
        quiz_text = openrouter_generate_quiz(prompt)
        
        if not quiz_text:
            print("OpenRouter failed, falling back to Gemini...")
            response = model.generate_content(prompt)
            quiz_text = response.text
            
        import json
        import re
        
        # Clean up code blocks if model included them
        if "```json" in quiz_text:
            cleaned = re.search(r'```json\s*(.*?)\s*```', quiz_text, re.DOTALL)
            if cleaned:
                quiz_text = cleaned.group(1)
        elif "```" in quiz_text:
            cleaned = re.search(r'```\s*(.*?)\s*```', quiz_text, re.DOTALL)
            if cleaned:
                quiz_text = cleaned.group(1)
            
        json_match = re.search(r'\{.*\}', quiz_text, re.DOTALL)
        if json_match:
            quiz_data = json.loads(json_match.group())
            return jsonify(quiz_data)
        else:
            raise ValueError("No JSON found in response")
            
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Quiz Generation Error: {str(e)}")
        # Provide a minimal fallback if everything fails
        return jsonify({
            'error': f"AI Generation Error: {str(e)}", 
            'details': "Please try a different topic or shorter request.",
            'raw': quiz_text[:500] if quiz_text else 'No response'
        }), 500

if __name__ == '__main__':
    debug_mode = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(debug=debug_mode, host='0.0.0.0', port=5000)
