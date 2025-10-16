import sys
from urllib.parse import urlparse, parse_qs
from youtube_transcript_api import YouTubeTranscriptApi

def get_video_id(url):
    query = parse_qs(urlparse(url).query)
    return query.get("v", [None])[0]

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python get_transcript.py <YouTube URL>")
        sys.exit(1)

    url = sys.argv[1]
    video_id = get_video_id(url)

    if not video_id:
        print("Invalid YouTube URL")
        sys.exit(1)

    try:
        ytt_api = YouTubeTranscriptApi()
        transcript = ytt_api.fetch(video_id)
        
        # ✅ Use .text instead of ['text']
        for entry in transcript:
            print(entry.text)

    except Exception as e:
        print(f"Error: {e}")
