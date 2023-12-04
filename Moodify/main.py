from dotenv import load_dotenv
import os
import base64
from requests import post, get
import json
import tekore as tk
import pandas as pd
from tqdm import tqdm
import random


load_dotenv()

client_id = os.getenv("CLIENT_ID")
client_secret = os.getenv("CLIENT_SECRET")

PLAYLIST_ID = "6q2pwjXKR8omfp62sfIxZE"  # Replace with your playlist ID

def get_token():
    auth_string = f"{client_id}:{client_secret}"
    auth_bytes = auth_string.encode("utf-8")
    auth_base64 = str(base64.b64encode(auth_bytes), "utf-8")

    url = "https://accounts.spotify.com/api/token"
    headers = {
        "Authorization": "Basic " + auth_base64,
        "Content-Type": "application/x-www-form-urlencoded",
    }
    data = {"grant_type": "client_credentials"}
    result = post(url, headers=headers, data=data)
    json_result = json.loads(result.content)
    token = json_result.get("access_token")
    return token


def get_auth_header(token):
    return {"Authorization": "Bearer " + token}


def get_playlist_tracks(token):
    url = f"https://api.spotify.com/v1/playlists/{PLAYLIST_ID}/tracks"
    headers = get_auth_header(token)
    result = get(url, headers=headers)
    json_result = json.loads(result.content)
    tracks = json_result["items"]
    return tracks


def import_random_song(tracks):
    if len(tracks) == 0:
        print("Empty playlist...")
        return None

    # Get a random index
    random_index = random.randint(0, len(tracks) - 1)

    # Extract song information
    random_track = tracks[random_index]
    song_name = random_track["track"]["name"]
    artist_name = random_track["track"]["artists"][0]["name"]
    song_uri = random_track["track"]["uri"]

    # Return song information
    return {"song_name": song_name, "artist_name": artist_name, "song_uri": song_uri}


token = get_token()
tracks = get_playlist_tracks(token)
random_song = import_random_song(tracks)

print(f"Random song from playlist: {random_song}")
