import google.generativeai as genai
from PIL import Image
import pytesseract
from dotenv import load_dotenv
import os

load_dotenv()  # Load environment variables

# Load Gemini API key from environment
GEMINI_API_KEY = 'AIzaSyBAhO_DvsH2KeA0b3Nkn_OxjNlaXZYifBU'

# Configure the API
genai.configure(api_key=GEMINI_API_KEY)

# Choose the model
model = genai.GenerativeModel('gemini-3-pro-preview')

def extract_text_from_image(image_path):
    """
    Extract text from an image using OCR.
    """
    try:
        img = Image.open(image_path)
        text = pytesseract.image_to_string(img)
        return text.strip()
    except Exception as e:
        return f"Error extracting text from image: {e}"

def solve_math_question(question):
    """
    Solve a math question using Google Gemini API.
    """
    prompt = f"""
You are GanitPeak, an expert math tutor. Solve the following math question step-by-step with clear explanations and LaTeX formatting for mathematical expressions.
Explain the concept behind each solution. Respond clearly, friendly, and educationally—like a human math teacher.
When uncertain, verify with reasoning or basic computation; never guess.

Question: {question}

Solution:
"""
    response = model.generate_content(prompt)
    return response.text

if __name__ == "__main__":
    print("Welcome to GanitPeak! Enter your math question (text or image path), or type 'quit' to exit.")
    while True:
        question_input = input("Math Question or Image Path: ")
        if question_input.lower() == 'quit':
            break
        if question_input.endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp')):
            question = extract_text_from_image(question_input)
            if question.startswith("Error"):
                print(question)
                continue
        else:
            question = question_input
        answer = solve_math_question(question)
        print("\n" + answer + "\n")
