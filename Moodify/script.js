const songInfoContainer = document.getElementById('song-info');
const songNameElement = document.getElementById('song-name');
const artistNameElement = document.getElementById('artist-name');
const songUriElement = document.getElementById('song-uri');

const getAuthorizationUrl = () => {
    const AUTH_URL = 'https://accounts.spotify.com/authorize';
    const params = new URLSearchParams({
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        scope: SCOPES,
        response_type: 'code',
    });

    return `${AUTH_URL}?${params.toString()}`;
};

const getAccessToken = async () => {
    const clientId = 'fa4877a3be26450785cde3989e23da99'; // Replace with your Spotify client ID
    const clientSecret = '3bcf8df5471d453d8247858881a38b40'; // Replace with your Spotify client secret

    const authString = `${clientId}:${clientSecret}`;
    const authBase64 = btoa(authString);

    const url = 'https://accounts.spotify.com/api/token';
    const headers = {
        Authorization: `Basic ${authBase64}`,
        'Content-Type': 'application/x-www-form-urlencoded',
    }
}
    
    // Update the data format
    const data = new URLSearchParams();
    data.append('grant_type', 'client_credentials');

    const response = await fetch(url, { method: 'POST', headers, body: data });
    const jsonResponse = await response.json();

    if (!response.ok) {
        throw new Error(`Failed to get access token: ${jsonResponse.error}`);
    }

    const accessToken = jsonResponse.access_token;
    return accessToken;
};

function shuffle(array) {
    let currentIndex = array.length;
    let randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;

const getRecommendedSongs = async (mood, genre) => {
    // Get access token
    const accessToken = await getAccessToken();

    // Define seed genres based on user input
    const seedGenres = genre.join(',');

    // Define target values based on mood
    let targetDanceabilityMin, targetDanceabilityMax, targetEnergyMin, targetEnergyMax, targetKey, targetLoudness, targetPopularityMin, targetPopularityMax, targetTempoMin, targetTempoMax, targetValence;

    switch (mood) {
        case 'happy':
            targetDanceabilityMin = 0.7;
            targetDanceabilityMax = 0.9;
            targetEnergyMin = 0.7;
            targetEnergyMax = 0.9;
            targetKey = 7; 
            targetLoudness = 0.8;
            targetPopularityMin = 20; 
            targetPopularityMax = 80; 
            targetTempoMin = 120; 
            targetTempoMax = 130; 
            targetValence = 0.85;
            break;
        case 'sad':
            targetDanceabilityMin = 0.2;
            targetDanceabilityMax = 0.4;
            targetEnergyMin = 0.2;
            targetEnergyMax = 0.4;
            targetKey = 2; 
            targetLoudness = 0.3;
            targetPopularityMin = 0; 
            targetPopularityMax = 60; 
            targetTempoMin = 60; 
            targetTempoMax = 70; 
            targetValence = 0.2;
            break;
        case 'angry':
            targetDanceabilityMin = 0.6;
            targetDanceabilityMax = 0.8;
            targetEnergyMin = 0.8;
            targetEnergyMax = 1.0;
            targetKey = 11; 
            targetLoudness = 0.9;
            targetPopularityMin = 10; 
            targetPopularityMax = 70; 
            targetTempoMin = 150; 
            targetTempoMax = 160; 
            targetValence = 0.3;
            break;
        case 'chill':
            targetDanceabilityMin = 0.4;
            targetDanceabilityMax = 0.6;
            targetEnergyMin = 0.4;
            targetEnergyMax = 0.6;
            targetKey = 5; 
            targetLoudness = 0.5;
            targetPopularityMin = 15; 
            targetPopularityMax = 75; 
            targetTempoMin = 90; 
            targetTempoMax = 100; 
            targetValence = 0.55;
            break;
        default:
            throw new Error('Invalid mood');
    }

    // Make a request to Spotify API to get recommended songs
    const url = `https://api.spotify.com/v1/recommendations?limit=100&market=FR&seed_genres=${seedGenres}&target_danceability_min=${targetDanceabilityMin}&target_danceability_max=${targetDanceabilityMax}&target_energy_min=${targetEnergyMin}&target_energy_max=${targetEnergyMax}&target_key=${targetKey}&target_loudness=${targetLoudness}&target_popularity=${targetPopularityMin}&target_valence=${targetValence}&target_tempo=${targetTempoMin}`;
    const headers = {
        Authorization: `Bearer ${accessToken}`,
    };

    const response = await fetch(url, { headers });
    const jsonResponse = await response.json();

    // Extract information about the recommended songs and their album images
    const recommendedSongs = jsonResponse.tracks.map((track) => {
        return {
            name: track.name,
            artist: track.artists.map((artist) => artist.name).join(', '),
            uri: track.uri,
            images: track.album.images, // Assuming you still want the track's album images
            // Additional property for the track's album cover
            albumCover: track.album.images[0]?.url, // Use optional chaining to handle potential missing images
        };
    });

    return recommendedSongs;
};

// Declare moodButtons as a global variable
let moodButtons;

// Function to create mood and genre buttons dynamically
const createButtons = (moods, genres) => {
    const moodContainer = document.getElementById('mood-buttons');
    const genreContainer = document.getElementById('genre-buttons');

    moods.forEach((mood) => {
        const moodButton = document.createElement('button');
        moodButton.textContent = mood;
        moodButton.addEventListener('click', () => {
            displayGenres(mood, genres);
        });
        moodContainer.appendChild(moodButton);
    });

    genres.forEach((genre) => {
        const genreButton = document.createElement('button');
        genreButton.textContent = genre;
        genreButton.addEventListener('click', () => {
            displayRecommendedSongs(selectedMood, genre);
        });
        genreContainer.appendChild(genreButton);
    });

    // Assign moodButtons here
    moodButtons = document.querySelectorAll('#mood-buttons button');

    // Initially hide genre buttons
    const genreButtons = document.querySelectorAll('#genre-buttons button');
    toggleButtons(genreButtons, false);
};

// Function to hide/show buttons
const toggleButtons = (buttons, show) => {
    buttons.forEach((button) => {
        button.style.display = show ? 'inline-block' : 'none';
    });
};

// Function to display genres based on the selected mood
const displayGenres = (selectedMood, genres) => {
    // Hide mood buttons
    toggleButtons(moodButtons, false);

    // Display genres based on the selected mood
    const genreContainer = document.getElementById('genre-buttons');
    genreContainer.innerHTML = '';

    genres.forEach((genre) => {
        const genreButton = document.createElement('button');
        genreButton.textContent = genre;
        genreButton.addEventListener('click', () => {
            displayRecommendedSongs(selectedMood, genre);
        });
        genreContainer.appendChild(genreButton);
    });

    // Show genre buttons
    const genreButtons = document.querySelectorAll('#genre-buttons button');
    toggleButtons(genreButtons, true);
};

// Function to display recommended songs based on the selected mood and genre
const displayRecommendedSongs = async (mood, genre) => {
    // Hide genre buttons
    const genreButtons = document.querySelectorAll('#genre-buttons button');
    genreButtons.forEach(button => button.style.display = 'none');

    // Call the getRecommendedSongs function from the previous example
    const recommendedSongs = await getRecommendedSongs(mood, [genre]);

    // Shuffle the recommendedSongs array
    const shuffledSongs = shuffle(recommendedSongs);

    // Display recommended songs and images in the UI
    const songContainer = document.getElementById('song-info');
    songContainer.innerHTML = '';

    shuffledSongs.slice(0, 3).forEach((song, index) => {
        // Create a container for each song
        const songInfoContainer = document.createElement('div');
        songInfoContainer.classList.add('song-container');
    
        // Create the glow element
        const glowElement = document.createElement('div');
        glowElement.classList.add('glow');
    
        // Append the glow element to the song information container
        songInfoContainer.appendChild(glowElement);
    
        // Display the album cover for the song with a clickable link
        if (song.albumCover) {
            const albumCoverLink = document.createElement('a');
            albumCoverLink.href = song.uri;
            albumCoverLink.target = '_blank'; // Open link in a new tab
            const albumCoverElement = document.createElement('img');
            albumCoverElement.src = song.albumCover;
            albumCoverElement.alt = `${song.name} - Album Cover`;
            albumCoverElement.height = 300;
            albumCoverElement.width = 300;
    
            // Append the image to the link
            albumCoverLink.appendChild(albumCoverElement);
            // Append the link to the song information container
            songInfoContainer.appendChild(albumCoverLink);
        }
    
        // Display the song information
        const songInfo = document.createElement('div');
        songInfo.innerHTML = `<p>Song: ${song.name}</p><p>Artist: ${song.artist}</p>`;
        songInfoContainer.appendChild(songInfo);
    
        // Append the song information container to the main container
        songContainer.appendChild(songInfoContainer);
    });

    // Function to handle 3D card hover effect
    function handleCardHover(e) {
        const card = e.currentTarget; // Use 'currentTarget' to refer to the element the listener is attached to
        const bounds = card.getBoundingClientRect();
        const glowElement = card.querySelector('.glow');
    
        function rotateToMouse(e) {
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            
            // Set initial opacity of the glow element
            glowElement.style.opacity = '1';

            // Calculate the center relative to the middle of the card
            const center = {
                x: mouseX - (bounds.x + bounds.width / 2),
                y: mouseY - (bounds.y + bounds.height / 2),
            };
        
            // Adjust the rotation based on the cursor position
            const rotationX = center.y / 100;
            const rotationY = -center.x / 100;
        
            const distance = Math.sqrt(center.x ** 2 + center.y ** 2);
        
            card.style.transform = `
                scale3d(1.07, 1.07, 1.07)
                rotate3d(
                    ${rotationX},
                    ${rotationY},
                    0,
                    ${Math.log(distance) * 2}deg
                )`;

            // Check if .glow element exists before accessing its style
            if (glowElement) {
                glowElement.style.backgroundImage = `
                    radial-gradient(
                        circle at ${center.x + bounds.width / 2}px ${center.y + bounds.height / 2}px,
                        #ffffff22,
                        #0000000f
                    )
                `;
            }
        }         
  
    card.addEventListener('mousemove', rotateToMouse);
  
    card.addEventListener('mouseleave', () => {
        card.removeEventListener('mousemove', rotateToMouse);
        card.style.transform = '';
        card.querySelector('.glow').style.backgroundImage = '';
        if (glowElement) {
            glowElement.style.backgroundImage = '';
            glowElement.style.opacity = '0';
        }
    });
  }

    // Show the "Back to Mood" button
    const backButtonContainer = document.getElementById('back-button-container');
    backButtonContainer.innerHTML = ''; // Clear previous content

    const backButton = document.createElement('button');
    backButton.textContent = 'Back to Mood';
    backButtonContainer.appendChild(backButton);

    // Event listener for "Back to Mood" button
    backButton.addEventListener('click', () => {
        // Reset UI and show mood buttons
        songContainer.innerHTML = '';
        const moodButtons = document.querySelectorAll('#mood-buttons button');
        moodButtons.forEach(button => button.style.display = 'inline-block');

        // Check if genre buttons are displayed
        const genreButtons = document.querySelectorAll('#genre-buttons button');
        if (genreButtons[0].style.display !== 'none') {
            backButtonContainer.innerHTML = ''; // Hide "Back to Mood" button
        } else {
            backButtonContainer.innerHTML = ''; // Clear the button container
        }
    });
    // Attach hover effect to each song container
    const songContainers = document.querySelectorAll('.song-container');
    songContainers.forEach(container => container.addEventListener('mouseenter', handleCardHover));
};

// Example usage:
const moods = ['angry','chill','happy', 'sad'];
const genres = ['ambient', 'classical', 'country', 'electro', 'jazz', 'hip-hop', 'pop', 'rock', 'r-n-b', 'soul']; // Add more genres as needed

// Call the createButtons function to generate the initial UI
createButtons(moods, genres);
