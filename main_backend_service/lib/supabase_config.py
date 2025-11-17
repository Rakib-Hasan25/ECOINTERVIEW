from supabase.client import Client, create_client
import os
from dotenv import load_dotenv 
load_dotenv() 
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)
BUCKET_NAME = 'file-storage'