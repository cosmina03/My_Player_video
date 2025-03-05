let video, canvas, ctx, playlist, currentIndex = 0, playPauseText;
let inputVideo;
let volumeIcon;
let playSpeed = 1;
let currentEfect=0;
let draggedItem = null;

const currentPath = window.location.href;
const path = currentPath.substring(0, currentPath.lastIndexOf('/'));

//video lista
const movies = [
    { title: "Koala.mp4", src: path +"/media/Koala.mp4" },
    { title: "Guinea.mp4", src: path+ "/media/porcusor_de_guinea.mp4" },
    { title: "Bufnita.mp4", src: path + "/media/bufnita.mp4" },
    { title: "Pasare.mp4", src: path+"/media/pasare.mp4" }
];

function initializePlayer(){
    playlist=document.getElementById('playlist');
    canvas=document.getElementById('video');

    ctx=canvas.getContext('2d');
    canvas.width = 854; 
    canvas.height = 480;

    //creare div pentru fiecare film
    movies.forEach((movie, index) => {
        const item = document.createElement('div');
        item.classList.add('playlist-item');
        item.textContent = movie.title;
        item.dataset.src = movie.src;
        item.draggable=true;
        playlist.appendChild(item); 
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('drop', handleDrop);

        const deleteButton=document.createElement('button');
        deleteButton.textContent="🗑";
        deleteButton.classList.add('delete-button');
        deleteButton.addEventListener('click', (e) => {
            remove(item);
        });
    
        item.appendChild(deleteButton);
        
    });


    video=document.createElement('video');
    video.crossOrigin = "anonymous"; 
    video.controls = false;
    video.addEventListener('timeupdate',draw);

    const savedVolume = localStorage.getItem('volume');
    if (savedVolume) {
        video.volume = parseFloat(savedVolume);
    }

    /*
   const savedIndex = localStorage.getItem('currentIndex');
    if (savedIndex) {
        currentIndex = parseInt(savedIndex, 10);
        loadVideo(movies[currentIndex].src); // Încarcă videoclipul corespunzător
    }*/

 //retinere index si rulare video
    playlist.addEventListener('click', (e) => {
        const clickedItem = e.target;
        if (clickedItem != null && clickedItem.dataset.src != null) {
            loadVideo(clickedItem.dataset.src); 
            currentIndex = findIndex(clickedItem); 
        }
      
    });

    video.addEventListener('ended', playNext);// continuitate rulare playlist

    canvas.addEventListener('click', handleCanvasClick);
     inputVideo = document.getElementById('add-video');
     inputVideo.addEventListener('change', handleVideoUpload);

     //adaugare evenimente butoane efecte
     document.getElementById('grayscale-effect').addEventListener('click', applyGrayscale);
     document.getElementById('sepia-effect').addEventListener('click', applySepia);
     document.getElementById('reset-effect').addEventListener('click', resetEffects);
     document.getElementById('speed-effect').addEventListener('click', increaseSpeed);
     document.getElementById('slow-effect').addEventListener('click', decreaseSpeed);
     
}

function draw(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1;// sa nu am transparenta
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        if(currentEfect==1){
            applyGrayscale();
        }
        if(currentEfect==2)
        {
            applySepia();
        }
        drawControls();

}
//gaseste video selectat
function findIndex(clickedItem){
    const itemsFromPlaylist=playlist.children;
    for (let i = 0; i < itemsFromPlaylist.length; i++) { 
        if (itemsFromPlaylist[i].dataset.src === clickedItem.dataset.src) {
            return i; 
        }
    }
}
function drawControls() {
    
    const barHeight = canvas.height * 0.1; // Înălțimea barei de control 
    const textSize = barHeight * 0.4; // Dimensiunea textului 
    const padding = 30; 
    const margin = 30; 
    const iconSize = textSize * 1.5;
    // Fundal bara de controale
    ctx.globalAlpha = 0.5; // Transparență pentru fundalul barei
    ctx.fillStyle = "#000";
    ctx.fillRect(0, canvas.height - barHeight, canvas.width, barHeight);

    //ctx.font = `${textSize}px Arial`;
    ctx.fillStyle = "#fff"; // Culoare text

    let currentX = padding; // Poziția de pornire pentru desenarea elementelor
    ctx.font = `${iconSize}px Arial`;

    //Butonul de play
    if (video.paused) {
        playPauseText = "▶"; 
    } else {
        playPauseText = "⏸"; 
    }
    ctx.fillText(playPauseText, currentX, canvas.height - barHeight / 2 + textSize / 2);
    currentX += ctx.measureText(playPauseText).width + margin;
   // ctx.font = `${textSize}px Arial`;

    // Bara de progres
    const progressWidth = canvas.width * 0.4; // Bara ocupă 60% din lățimea canvas-ului
    const progressHeight = barHeight * 0.2; // Înălțimea barei de progres (20% din barHeight)
    const progressY = canvas.height - barHeight + (barHeight - progressHeight) / 2;
    const progress = (video.currentTime / video.duration) * progressWidth;

    ctx.fillStyle = "#555"; // Fundalul barei de progres
    ctx.fillRect(currentX, progressY, progressWidth, progressHeight);
    ctx.fillStyle = "#ffcc00"; // Bara de progres efectivă
    ctx.fillRect(currentX, progressY, progress, progressHeight);

    currentX += progressWidth + margin ;

    // Butonul de inapoi
    const previousWidth = ctx.measureText("<<").width;
    ctx.fillText("<<", currentX, canvas.height - barHeight / 2 + textSize / 2);
    currentX += previousWidth + margin;

    // Butonul pentru urmatorul video
    const nextWidth = ctx.measureText(">>").width;
    ctx.fillText(">>", currentX, canvas.height - barHeight / 2 + textSize / 2);
    currentX += nextWidth + margin;

  //Butonul de mute si unmute    
    if (video.muted) {
        volumeIcon = "🔇"; // Volum oprit
    } else {
        volumeIcon = "🔊"; // Volum activ
    }
    const volumWidth = ctx.measureText(volumeIcon).width;
    ctx.fillText(volumeIcon, currentX, canvas.height - barHeight / 2 + textSize / 2);
    currentX += volumWidth  + margin/2;

    //Bara de volum
    const volumeWidth = canvas.width*0.2 
    const volumeHeight = barHeight * 0.2;
    const volumeY = canvas.height - barHeight + (barHeight - volumeHeight) / 2;
    
    ctx.fillStyle = "#555"; // Fundal
    ctx.fillRect(currentX, volumeY, volumeWidth, volumeHeight);

    const volumeLevel = video.volume * volumeWidth; 
    ctx.fillStyle = "#ffcc00";
    ctx.fillRect(currentX, volumeY, volumeLevel, volumeHeight);
   
}

function loadVideo(src) {

    video.src = src;
    localStorage.setItem('currentIndex', currentIndex);

    video.load();
    video.play().catch((error) => {
        console.error("Eroare la redare video:", error.message);
    });
}

function handleCanvasClick(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left; // Coordonata X relativă la canvas
    const y = event.clientY - rect.top;  // Coordonata Y relativă la canvas

    const barHeight = canvas.height * 0.1; 
    const padding = 30; 
    const margin = 30; 

    if (y > canvas.height - barHeight) {
        let currentX = padding;

       
        const playPauseWidth = ctx.measureText(playPauseText).width;

        // Detectează clicul pe butonul Play/Pause
        if (x > currentX && x < currentX + playPauseWidth) {
            playPause(); 
            return;
        }
        currentX += playPauseWidth + margin;

        // Detectează clicul pe bara de progres
        const progressWidth = canvas.width * 0.4;
        const progressHeight = barHeight * 0.2;
        const progressY = canvas.height - barHeight + (barHeight - progressHeight) / 2;

        if (x > currentX && x < currentX + progressWidth) {
            videoSeek(x, currentX, progressWidth);
            return;
        }
        currentX += progressWidth + margin;

       
        const previousWidth = ctx.measureText("<<").width;
        if (x > currentX && x < currentX + previousWidth) {
            playPrevious(); 
            return;
        }
        currentX += previousWidth + margin;

        // Detectează clicul pe butonul Next
        const nextWidth = ctx.measureText(">>").width;
        if (x > currentX && x < currentX + nextWidth) {
            playNext(); // Redă videoclipul următor
            return;
        }
        currentX += nextWidth + margin;

        // Detectează clicul pe iconița de volum
        const volumeIconWidth = ctx.measureText(volumeIcon).width;
        if (x > currentX && x < currentX + volumeIconWidth) {
            UnmuteMute(); 
            return;
        }
        currentX += volumeIconWidth + margin / 2;

        // Detectează clicul pe bara de volum
        const volumeWidth = canvas.width * 0.2;
        const volumeHeight = barHeight * 0.2;
        const volumeY = canvas.height - barHeight + (barHeight - volumeHeight) / 2;

        if (x > currentX && x < currentX + volumeWidth) {
            adjustVolume(x, currentX, volumeWidth);
            return;
        }
    }
 }

function playPause(){
      if (video.paused) {
        video.play();
    } else {
        video.pause();
    }
    draw();

}
function increaseSpeed() {
    playSpeed = Math.min(playSpeed + 0.25, 3); // Crește viteza până la 3x
    video.playbackRate = playSpeed; // Aplică viteza videoclipului
    console.log(`Playback speed: ${playSpeed}`);
}

function videoSeek(clickX, currentX, progressWidth){
    const click = (clickX - currentX) / progressWidth;
    video.currentTime = click * video.duration; 
    draw();
}

function playPrevious() {
    if (currentIndex === 0) {
        // Dacă este primul videoclip, treci la ultimul
        currentIndex = playlist.children.length - 1;
    } else {
        // Treci la videoclipul anterior
        currentIndex -= 1;
    }
    
    const previousVideo = playlist.children[currentIndex].dataset.src;
    loadVideo(previousVideo); 
}
function playNext(){
    if(currentIndex===(playlist.children.length - 1)){
        currentIndex=0;
    }else{
        currentIndex += 1;
    }
    const previousVideo = playlist.children[currentIndex].dataset.src;
    loadVideo(previousVideo); // Redă videoclipul selectat
}

function handleVideoUpload(event) {
    const files = event.target.files; // Obține fișierele selectate
    for (const file of files) {
        if (file.type.startsWith('video/')) { 
            const url = URL.createObjectURL(file); 
            const newItem = document.createElement('div');
            newItem.classList.add('playlist-item');
            newItem.textContent = file.name;
            newItem.dataset.src = url; 
            newItem.draggable=true;
            newItem.addEventListener('dragstart', handleDragStart);
            newItem.addEventListener('dragover', handleDragOver);
            newItem.addEventListener('drop', handleDrop);
            playlist.appendChild(newItem); // Adaugă în playlist
            movies.push({ title: file.name, src: url });

            const deleteButton=document.createElement('button');
            deleteButton.textContent="🗑";
            deleteButton.classList.add('delete-button');
            deleteButton.addEventListener('click', (e) => {
                remove(newItem);
            });
        
            newItem.appendChild(deleteButton);
        }
    }
}


function handleDragStart(event) {
    draggedItem = event.target;
    event.dataTransfer.effectAllowed = 'move';
    draggedItem.classList.add('dragging');
}

function handleDragOver(event) {
    event.preventDefault(); // Permite drop-ul
    const target = event.target;
    if (target && target !== draggedItem && target.classList.contains('playlist-item')) {
        const bounding = target.getBoundingClientRect();
        const offset = event.clientY - bounding.top;
        if (offset > bounding.height / 2) {
            target.after(draggedItem);
        } else {
            target.before(draggedItem);
        }
    }
}

function handleDrop(event) {
    event.preventDefault();
    draggedItem.classList.remove('dragging');
    updateMoviesArray();
}

function updateMoviesArray() {
    movies.length = 0;
    const items = playlist.querySelectorAll('.playlist-item');
    items.forEach((item) => {
        movies.push({
            title: item.textContent,
            src: item.dataset.src
        });
    });
}

function remove(item){
    item.remove();
    updateMoviesArray();

}

function UnmuteMute() {
    if (video.muted) {
        video.muted = false; // Scoate mute-ul
    } else {
        video.muted = true; // Activează mute-ul
    }
    draw(); 
}

function adjustVolume(clickX, volumeX, volumeWidth) {
    const volumeLevel = (clickX - volumeX) / volumeWidth;
    video.volume = Math.min(Math.max(volumeLevel, 0), 1);
    localStorage.setItem('volume', video.volume);
    draw(); 
}



function applyGrayscale() {
    const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = frame.data;
    currentEfect=1;

    for (let i = 0; i < pixels.length; i += 4) {
        const avg = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
        pixels[i] = pixels[i + 1] = pixels[i + 2] = avg; 
    }

    ctx.putImageData(frame, 0, 0);
}

function applySepia() {
    const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = frame.data;
    currentEfect=2;

    for (let i = 0; i < pixels.length; i += 4) {
        const red = pixels[i];
        const green = pixels[i + 1];
        const blue = pixels[i + 2];

        pixels[i] = red * 0.393 + green * 0.769 + blue * 0.189; // R
        pixels[i + 1] = red * 0.349 + green * 0.686 + blue * 0.168; // G
        pixels[i + 2] = red * 0.272 + green * 0.534 + blue * 0.131; // B
    }

    ctx.putImageData(frame, 0, 0);
}


function resetEffects() {
    currentEfect=0;
    let playbackSpeed = 1;
    video.playbackRate=playbackSpeed;
    video.currentTime = video.currentTime; 
    draw(); 
}

function decreaseSpeed() {
    playSpeed = Math.max(playSpeed - 0.25, 0.25); 
    video.playbackRate = playSpeed;
    console.log(`Playback speed: ${playSpeed}`);
}
window.onload = initializePlayer;

