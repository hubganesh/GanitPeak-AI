import os
from supabase import create_client
from dotenv import load_dotenv
import sys

# Ensure UTF-8 output
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer)

def remove_bad_video():
    load_dotenv()
    SUPABASE_URL = os.getenv('SUPABASE_URL')
    SUPABASE_KEY = os.getenv('SUPABASE_KEY')
    
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("Error: SUPABASE_URL or SUPABASE_KEY not found in .env")
        return

    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    # Try to delete by title or ID 5f9da839
    print("Attempting to remove ghost video entry...")
    
    # 2. Try by ID prefix (from trace log)
    ids_to_remove = ["5f9da839", "ba6ff21f"]
    for vid_id in ids_to_remove:
        res = supabase.table("videos").delete().ilike("video_url", f"%{vid_id}%").execute()
        if res.data:
            print(f"Successfully removed ID {vid_id} from video_url.")
        
        # Also try matching ID as the primary key if it's stored there
        # but usually Supabase IDs are UUIDs or integers
        
    # 3. Try by exact title variants
    titles = [
        "Integral by U-Substitution: ∫(2x cos(x²))dx",
        "Solve the integral: ∫(2xcos(x²))dx",
        "∫(2xcos(x2))dx"
    ]
    for title in titles:
        res = supabase.table("videos").delete().eq("title", title).execute()
        if res.data:
            print(f"Successfully removed by title: {title}")

if __name__ == "__main__":
    remove_bad_video()
