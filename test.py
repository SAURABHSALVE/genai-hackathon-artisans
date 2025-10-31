
# import google.generativeai as genai
# from google.oauth2 import service_account
# import os

# # Set the path to your service account key file
# os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = r"C:\Users\vinit\Downloads\genai-hackathon-artisans-dev\genai-hackathon-artisans-dev\service-account-key.json"

# try:
#     # Load credentials
#     credentials = service_account.Credentials.from_service_account_file(
#         os.environ["GOOGLE_APPLICATION_CREDENTIALS"],
#         scopes=["https://www.googleapis.com/auth/cloud-platform"]
#     )
#     print("Credentials loaded successfully.")

#     # Configure the Generative AI client
#     genai.configure(credentials=credentials)
#     print("Generative AI client configured.")

#     # Define the model (use a model from the list_models output, e.g., gemini-1.5-flash)
#     model = genai.GenerativeModel("gemini-1.5-flash")
#     print("Model initialized.")

#     # Prepare the prompt
#     prompt = "Generate a short story about Vikram, traditional crafts in Maharashtra."

#     # Call the model
#     response = model.generate_content(prompt)
#     print("Content generated successfully.")

#     # Extract and print the generated content
#     generated_text = response.text
#     print("Generated Story:")
#     print(generated_text)

# except Exception as e:
#     print(f"Error: {e}")


import os
print(
    f"{os.getenv('DB_USER')}:{os.getenv('DB_PASS')}@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
)
