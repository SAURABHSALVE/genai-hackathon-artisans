# import requests
# import json

# # 1. Paste your new API key here
# API_KEY = "AIzaSyAajSBRgnWk8yTm0pzEwnNoakuD-iCnGUg" 

# # An example address to look up
# address = "1600 Amphitheatre Parkway, Mountain View, CA"

# # The Google Maps Geocoding API endpoint URL
# url = f"https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={API_KEY}"

# print(f"Querying URL: {url}\n")

# # Make the HTTP GET request
# response = requests.get(url)

# # Check if the request was successful (status code 200)
# if response.status_code == 200:
#     print("✅ Success! API key is working.")
#     # Parse and print the JSON response
#     data = response.json()
#     print(json.dumps(data, indent=2))
# else:
#     print(f"❌ Error: Failed to make request.")
#     print(f"Status Code: {response.status_code}")
#     print("Response:")
#     print(response.text)





import vertexai
from vertexai.generative_models import GenerativeModel

# Initialize Vertex AI with your project details
vertexai.init(project="hackathon-genai-475313", location="us-central1")

# The exact system instructions you wrote in the Studio
system_instructions = """
You are a poetic storyteller who brings handmade crafts to life.
You narrate their origin, heritage, and emotions as if the craft itself is speaking.
Your tone is lyrical, emotional, and culturally grounded.
"""

# SOLUTION: Use a powerful and stable model that is available for API calls
model = GenerativeModel(
    "gemini-2.5-flash",
    system_instruction=system_instructions
)

# This is the new prompt you send to the model
user_prompt = "Tell me about a hand-carved wooden elephant from Kerala."

print("Sending prompt to the model...")

try:
    # Send the prompt and get the response
    response = model.generate_content(user_prompt)

    print("--- Model Response ---")
    print(response.text)

except Exception as e:
    print(f"An error occurred: {e}")