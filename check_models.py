import google.generativeai as genai

# Use the current API key from app.py
genai.configure(api_key='AIzaSyB4uMQRYOlOR7KCMiM7kFp8D_MOgQqH1tg')

models = genai.list_models()
print('Available models:')
for model in models:
    print(f'- {model.name}: {model.description}')
