# import jwt
# import datetime

# payload = {
#     "user_id": 1,  # replace with actual user id if needed
#     "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
# }

# token = jwt.encode(payload, "2ae74a149f3221dd1cb16baa3c13ceb10066845882f302adfb56c3556fd38618", algorithm="HS256")
# print(token)




# import google.generativeai as genai

# # Configure the API key
# genai.configure(api_key="AQ.Ab8RN6Kk8fOTb5K07kAIwOhu1NUBqal9jXxqNsp0L0ADz09FnQ")  # Replace with your actual API key

# # Define the model
# model = genai.GenerativeModel("gemini-1.5-flash")  # Use the correct model name

# # Prepare the prompt
# prompt = "Generate a short story about Vikram, traditional crafts in Maharashtra."

# # Call the model
# response = model.generate_content(prompt)

# # Extract and print the generated content
# generated_text = response.text
# print(generated_text)


import google.generativeai as genai
from google.oauth2 import service_account
import os

# Set the path to your service account key file
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = r"C:\Users\vinit\Downloads\genai-hackathon-artisans-dev\genai-hackathon-artisans-dev\service-account-key.json"

try:
    # Load credentials
    credentials = service_account.Credentials.from_service_account_file(
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"],
        scopes=["https://www.googleapis.com/auth/cloud-platform"]
    )
    print("Credentials loaded successfully.")

    # Configure the Generative AI client
    genai.configure(credentials=credentials)
    print("Generative AI client configured.")

    # Define the model (use a model from the list_models output, e.g., gemini-1.5-flash)
    model = genai.GenerativeModel("gemini-1.5-flash")
    print("Model initialized.")

    # Prepare the prompt
    prompt = "Generate a short story about Vikram, traditional crafts in Maharashtra."

    # Call the model
    response = model.generate_content(prompt)
    print("Content generated successfully.")

    # Extract and print the generated content
    generated_text = response.text
    print("Generated Story:")
    print(generated_text)

except Exception as e:
    print(f"Error: {e}")