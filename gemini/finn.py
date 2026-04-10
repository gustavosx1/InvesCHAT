from dotenv import load_dotenv
import finnhub

import pandas as pd
import os

load_dotenv()
api_key = os.environ.get("FINN_API_KEY")
# Setup client
finnhub_client = finnhub.Client(api_key)

print(finnhub_client.covid19())

print(finnhub_client.company_news("AAPL", _from="2025-06-01", to="2026-06-10"))
