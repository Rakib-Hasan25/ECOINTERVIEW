import os
from googleapiclient.discovery import build

def fetch_youtube_videos(search_query):
    """
    Fetch YouTube videos based on a search query.
    
    Args:
        search_query (str): The search query/topic to find videos for
        
    Returns:
        list: A list of dictionaries containing video information:
            - title (str): Video title
            - url (str): Complete YouTube video URL
            - img_src (str): Thumbnail image URL
            - iframe_src (str): Embed URL for iframe
    """
    try:
        # Validate inputs
        if not search_query or not search_query.strip():
            raise ValueError("search_query is required")
        
        # Get API key from environment variable
        api_key = os.environ.get("YOUTUBE_API_KEY")
        if not api_key:
            raise ValueError("YOUTUBE_API_KEY environment variable is not set")
        
        # Build YouTube API client
        youtube = build("youtube", "v3", developerKey=api_key)
        
        # Search for videos (only 1 result)
        response = youtube.search().list(
            q=search_query,
            part="snippet",
            type="video",
            maxResults=1,
            order="relevance"  # Order by relevance
        ).execute()
        
        # Extract video information (only first result)
        videos = []
        items = response.get("items", [])
        if items:
            item = items[0]  # Get only the first video
            video_id = item["id"]["videoId"]
            snippet = item["snippet"]
            
            video_info = {
                "title": snippet["title"],
                "url": f"https://www.youtube.com/watch?v={video_id}",
                "img_src": snippet["thumbnails"].get("high", {}).get("url") or snippet["thumbnails"].get("medium", {}).get("url") or snippet["thumbnails"].get("default", {}).get("url"),
                "iframe_src": f"https://www.youtube.com/embed/{video_id}"
            }
            
            videos.append(video_info)
        
        return videos
        
    except Exception as e:
        import traceback
        print(f"Error in fetch_youtube_videos: {str(e)}")
        print(traceback.format_exc())
        raise e

