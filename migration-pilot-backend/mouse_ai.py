import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
meta_key = os.getenv("META_API_KEY")
# Gemini_key = os.getenv("GEINI_API_KEY")
client = OpenAI(
    api_key=meta_key,
    base_url="https://api.meta.ai/v1",
    # api_key = Gemini_key
    # base_url ="https://"
)

response = client.responses.create(
    model="muse-spark-1.3", input="Explain mixture-of-experts in two sentences."
)
print(response.output_text)
# 12434
