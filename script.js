let songs = [
    {songName: "Aaj Ke Baad", filePath: "songs/1.mp3", coverPath: "covers/1.jpg"},
    {songName: "Closer", filePath: "songs/2.mp3", coverPath: "covers/2.jpg"},
    {songName: "Dil se dil tak", filePath: "songs/3.mp3", coverPath: "covers/3.jpg"},
    {songName: "Jalebi", filePath: "songs/4.mp3", coverPath: "covers/4.jpeg"},
    {songName: "Janiye", filePath: "songs/5.mp3", coverPath: "covers/5.jpg"},
    {songName: "Naina", filePath: "songs/6.mp3", coverPath: "covers/6.jpg"},
    {songName: "Pehle bhi main", filePath: "songs/7.mp3", coverPath: "covers/7.jpg"},
    {songName: "Love Story", filePath: "songs/8.mp3", coverPath: "covers/8.png"},
    {songName: "Tum Kya mile", filePath: "songs/9.mp3", coverPath: "covers/9.jpg"},
    {songName: "What Jhumka?", filePath: "songs/10.mp3", coverPath: "covers/10.jpg"},
];

let masterPlay = document.getElementById('masterPlay');
let myProgressBar = document.getElementById('myProgressBar');
let gif = document.getElementById('gif');
let masterSongName = document.getElementById('masterSongName');
let songItems = Array.from(document.getElementsByClassName('songItem'));
let audioElement = new Audio(songs[0].filePath);
let currentSongIndex = 0;

songItems.forEach((element, i)=>{ 
    element.getElementsByTagName("img")[0].src = songs[i].coverPath; 
    element.getElementsByClassName("songName")[0].innerText = songs[i].songName; 
});

songItems.forEach((element, i)=>{
    element.getElementsByClassName('songItemPlay')[0].addEventListener('click', ()=>{
        playSong(i);
    });
});

masterPlay.addEventListener('click', ()=>{
    if(audioElement.paused || audioElement.currentTime<=0){
        audioElement.play();
        masterPlay.classList.remove('fa-play-circle');
        masterPlay.classList.add('fa-pause-circle');
        gif.style.opacity = 1;
    }
    else{
        audioElement.pause();
        masterPlay.classList.remove('fa-pause-circle');
        masterPlay.classList.add('fa-play-circle');
        gif.style.opacity = 0;
    }
});

audioElement.addEventListener('timeupdate', () => {
    progress = parseInt((audioElement.currentTime / audioElement.duration) * 100); 
    myProgressBar.value = progress;
    
    // Calculate current time in minutes and seconds
    let currentTimeMinutes = Math.floor(audioElement.currentTime / 60);
    let currentTimeSeconds = Math.floor(audioElement.currentTime - currentTimeMinutes * 60);
    
    // Pad single digit seconds with a leading zero
    if (currentTimeSeconds < 10) {
        currentTimeSeconds = "0" + currentTimeSeconds;
    }

    // Calculate total duration in minutes and seconds
    let durationMinutes = Math.floor(audioElement.duration / 60);
    let durationSeconds = Math.floor(audioElement.duration - durationMinutes * 60);
    
    // Pad single digit seconds with a leading zero
    if (durationSeconds < 10) {
        durationSeconds = "0" + durationSeconds;
    }

    // Display the timestamp
    masterSongName.innerText = `${currentTimeMinutes}:${currentTimeSeconds} / ${durationMinutes}:${durationSeconds}`;
});

myProgressBar.addEventListener('change', ()=>{
    audioElement.currentTime = myProgressBar.value * audioElement.duration/100;
});

document.getElementById('next').addEventListener('click', () => {
    console.log("Next button clicked");
    playNextSong();
});

document.getElementById('previous').addEventListener('click', () => {
    console.log("Previous button clicked");
    playPreviousSong();
});

document.getElementById('shuffle').addEventListener('click', () => {
    shuffleSongs();
});

function playSong(index) {
    makeAllPlays();
    let currentSong = songs[index];
    audioElement.src = currentSong.filePath;
    masterSongName.innerText = currentSong.songName;
    audioElement.currentTime = 0;
    audioElement.play();
    gif.style.opacity = 1;
    masterPlay.classList.remove('fa-play-circle');
    masterPlay.classList.add('fa-pause-circle');
    currentSongIndex = index;
    updateCurrentSongInfo();
}

function playNextSong() {
    if (currentSongIndex < songs.length - 1) {
        currentSongIndex++;
    } else {
        currentSongIndex = 0; // Start from the first song if the current song is the last one
    }
    console.log("Current song index:", currentSongIndex);
    playSong(currentSongIndex);
}

function playPreviousSong() {
    if (currentSongIndex > 0) {
        currentSongIndex--;
    } else {
        currentSongIndex = songs.length - 1; // Go to the last song if the current song is the first one
    }
    console.log("Current song index:", currentSongIndex);
    playSong(currentSongIndex);
}

function shuffleSongs() {
    let shuffledSongs = [...songs];
    for (let i = shuffledSongs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledSongs[i], shuffledSongs[j]] = [shuffledSongs[j], shuffledSongs[i]];
    }
    songs = shuffledSongs;
    currentSongIndex = 0;
    playSong(currentSongIndex);
}

function updateCurrentSongInfo() {
    // Update the song info in the bottom left corner
    document.getElementById('currentSongInfo').innerHTML = `<img src="playing.gif" width="42px" alt="" id="gif"> 
                                                            <span>${songs[currentSongIndex].songName}</span>`;
}

const makeAllPlays = ()=>{
    Array.from(document.getElementsByClassName('songItemPlay')).forEach((element)=>{
        element.classList.remove('fa-pause-circle');
        element.classList.add('fa-play-circle');
    });
}
