// 打字效果相关变量和函数
let currentText = '';
let currentIndex = 0;
let isDeleting = false;

// 打字效果函数
function type() {
    const texts = ['AI算法工程师', '软件工程师', '创新技术开发者'];
    const subtitle = document.querySelector('.subtitle');
    if (!subtitle) return;

    const currentTextIndex = currentIndex % texts.length;
    const fullText = texts[currentTextIndex];

    if (isDeleting) {
        currentText = fullText.substring(0, currentText.length - 1);
    } else {
        currentText = fullText.substring(0, currentText.length + 1);
    }

    subtitle.textContent = currentText;

    let typeSpeed = isDeleting ? 100 : 200;

    if (!isDeleting && currentText === fullText) {
        typeSpeed = 2000; // 停留时间
        isDeleting = true;
    } else if (isDeleting && currentText === '') {
        isDeleting = false;
        currentIndex++;
        typeSpeed = 500;
    }

    setTimeout(type, typeSpeed);
}

// 技术栈动画
function initSkillsAnimation() {
    const skillItems = document.querySelectorAll('.skills ul li');
    if (!skillItems.length) return;

    // 添加初始样式
    skillItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
    });

    // 创建Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const item = entry.target;
                // 添加动画
                item.style.transition = 'all 0.5s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
                // 停止观察这个元素
                observer.unobserve(item);
            }
        });
    }, {
        threshold: 0.1
    });

    // 开始观察每个技能项
    skillItems.forEach(item => observer.observe(item));
}

// 图片轮播功能
function initImageSlider() {
    const sliderWrapper = document.querySelector('.slider-wrapper');
    const images = document.querySelectorAll('.slider-image');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const dotsContainer = document.querySelector('.slider-dots');
    
    let currentIndex = 0;
    const totalImages = images.length;

    // 创建导航点
    images.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });

    // 更新轮播图位置
    function updateSlider() {
        sliderWrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
        // 更新导航点
        document.querySelectorAll('.dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }

    // 跳转到指定幻灯片
    function goToSlide(index) {
        currentIndex = index;
        updateSlider();
    }

    // 下一张
    function nextSlide() {
        currentIndex = (currentIndex + 1) % totalImages;
        updateSlider();
    }

    // 上一张
    function prevSlide() {
        currentIndex = (currentIndex - 1 + totalImages) % totalImages;
        updateSlider();
    }

    // 添加按钮事件监听
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);

    // 自动播放
    let autoplayInterval = setInterval(nextSlide, 5000);

    // 鼠标悬停时暂停自动播放
    const sliderContainer = document.querySelector('.slider-container');
    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', () => {
            clearInterval(autoplayInterval);
        });

        sliderContainer.addEventListener('mouseleave', () => {
            autoplayInterval = setInterval(nextSlide, 5000);
        });
    }

    // 触摸滑动支持
    let touchStartX = 0;
    let touchEndX = 0;

    sliderWrapper.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    });

    sliderWrapper.addEventListener('touchmove', (e) => {
        touchEndX = e.touches[0].clientX;
    });

    sliderWrapper.addEventListener('touchend', () => {
        const difference = touchStartX - touchEndX;
        if (Math.abs(difference) > 50) {
            if (difference > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
    });
}

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 开始打字效果
    setTimeout(() => {
        type();
        initSkillsAnimation();
        initImageSlider();  // 初始化图片轮播
    }, 1000);

    // 初始化音乐播放器
    initMusicPlayer();

    // 添加项目卡片动画延迟
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach((card, index) => {
        card.style.setProperty('--animation-order', index);
    });

    // 添加技能标签动画延迟
    const skillItems = document.querySelectorAll('.skills ul li');
    skillItems.forEach((item, index) => {
        item.style.setProperty('--animation-order', index);
    });

    // 添加滚动动画
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                scrollObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // 为所有需要滚动动画的元素添加观察器
    document.querySelectorAll('.scroll-reveal').forEach(el => {
        scrollObserver.observe(el);
    });

    // 添加鼠标移动视差效果
    document.addEventListener('mousemove', (e) => {
        const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
        const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
        
        document.querySelectorAll('.parallax').forEach(element => {
            element.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
    });
});

// 音乐播放器初始化
function initMusicPlayer() {
    console.log('Initializing music player...');

    // 获取DOM元素
    const audio = new Audio();
    const playBtn = document.getElementById('play-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const volumeIcon = document.getElementById('volume-icon');
    const progressBar = document.querySelector('.progress');
    const songName = document.querySelector('.song-name');
    const currentTimeSpan = document.querySelector('.current-time');
    const durationSpan = document.querySelector('.duration');

    // 验证DOM元素
    const elements = {
        playBtn,
        prevBtn,
        nextBtn,
        volumeSlider,
        volumeIcon,
        progressBar,
        songName,
        currentTimeSpan,
        durationSpan
    };

    // 检查是否所有元素都存在
    let missingElements = false;
    for (const [name, element] of Object.entries(elements)) {
        if (!element) {
            console.error(`Error: Could not find element: ${name}`);
            missingElements = true;
        }
    }

    // 如果有缺失元素，终止初始化
    if (missingElements) {
        console.error('Missing required elements, music player initialization aborted');
        return;
    }

    console.log('All DOM elements found successfully');

    // 播放器状态
    let isPlaying = false;
    let currentSongIndex = 0;
    let previousVolume = 0.5;

    // 音乐播放列表
    const playlist = [
        {
            title: '爱在西元前',
            artist: '周杰伦',
            file: 'assets/music/周杰伦-爱在西元前.mp3'
        },
        {
            title: '若梦',
            artist: '周深',
            file: 'assets/music/周深-若梦-《与君歌》电视剧主题曲.mp3'
        },
        {
            title: '起风了',
            artist: '林俊杰',
            file: 'assets/music/林俊杰-起风了.mp3'
        },
        {
            title: '出现又离开',
            artist: '梁博',
            file: 'assets/music/梁博-出现又离开 (Live).mp3'
        },
        {
            title: '日落大道',
            artist: '梁博',
            file: 'assets/music/梁博-日落大道.mp3'
        },
        {
            title: '曾经是情侣',
            artist: '梁博',
            file: 'assets/music/梁博-曾经是情侣 (Live).mp3'
        },
        {
            title: '男孩',
            artist: '梁博',
            file: 'assets/music/梁博-男孩 (Live).mp3'
        },
        {
            title: '八十年代的歌',
            artist: '赵雷',
            file: 'assets/music/赵雷-八十年代的歌.mp3'
        },
        {
            title: '我记得',
            artist: '赵雷',
            file: 'assets/music/赵雷-我记得.mp3'
        },
        {
            title: '玛丽',
            artist: '赵雷',
            file: 'assets/music/赵雷-玛丽.mp3'
        }
    ];

    // 初始化音频
    if (playlist.length > 0) {
        console.log('Setting initial song:', playlist[0].title);
        audio.src = playlist[0].file;
        songName.textContent = playlist[0].title;
    }

    // 音量初始化
    audio.volume = volumeSlider.value / 100;
    console.log('Initial volume set to:', audio.volume);

    // 错误处理
    audio.addEventListener('error', function(e) {
        console.error('Audio error:', e);
        if (audio.error) {
            console.error('Error code:', audio.error.code);
            console.error('Error message:', audio.error.message);
        }
    });

    // 加载并播放歌曲
    function loadAndPlaySong() {
        const song = playlist[currentSongIndex];
        console.log('Loading song:', song.title);
        audio.src = song.file;
        songName.textContent = song.title;
        
        audio.play()
            .then(() => {
                console.log('New song started playing:', song.title);
                isPlaying = true;
                playBtn.classList.replace('fa-play', 'fa-pause');
            })
            .catch(error => {
                console.error('Error playing new song:', error);
                console.error('Song path:', song.file);
            });
    }

    // 更新音量图标
    function updateVolumeIcon(value) {
        if (value == 0) {
            volumeIcon.classList.replace('fa-volume-up', 'fa-volume-mute');
        } else {
            volumeIcon.classList.replace('fa-volume-mute', 'fa-volume-up');
        }
    }

    // 格式化时间
    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // 添加事件监听器
    if (playBtn) {
        playBtn.addEventListener('click', function() {
            console.log('Play button clicked');
            if (playlist.length === 0) {
                console.log('No songs in playlist');
                return;
            }
            
            if (isPlaying) {
                console.log('Pausing playback');
                audio.pause();
                playBtn.classList.replace('fa-pause', 'fa-play');
            } else {
                console.log('Starting playback');
                audio.play()
                    .then(() => {
                        console.log('Playback started successfully');
                        playBtn.classList.replace('fa-play', 'fa-pause');
                    })
                    .catch(error => {
                        console.error('Error playing audio:', error);
                    });
            }
            isPlaying = !isPlaying;
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            console.log('Previous button clicked');
            if (playlist.length === 0) return;
            
            currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
            console.log('Switching to previous song, index:', currentSongIndex);
            loadAndPlaySong();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            console.log('Next button clicked');
            if (playlist.length === 0) return;
            
            currentSongIndex = (currentSongIndex + 1) % playlist.length;
            console.log('Switching to next song, index:', currentSongIndex);
            loadAndPlaySong();
        });
    }

    if (volumeSlider) {
        volumeSlider.addEventListener('input', function(e) {
            const value = e.target.value;
            console.log('Volume changed to:', value);
            audio.volume = value / 100;
            updateVolumeIcon(value);
        });
    }

    if (volumeIcon) {
        volumeIcon.addEventListener('click', function() {
            console.log('Volume icon clicked');
            if (audio.volume > 0) {
                previousVolume = audio.volume;
                audio.volume = 0;
                volumeSlider.value = 0;
                volumeIcon.classList.replace('fa-volume-up', 'fa-volume-mute');
                console.log('Muted audio');
            } else {
                audio.volume = previousVolume;
                volumeSlider.value = previousVolume * 100;
                volumeIcon.classList.replace('fa-volume-mute', 'fa-volume-up');
                console.log('Unmuted audio, volume:', previousVolume);
            }
        });
    }

    if (audio) {
        audio.addEventListener('timeupdate', function() {
            const duration = audio.duration;
            const currentTime = audio.currentTime;
            const progressPercent = (currentTime / duration) * 100;
            
            progressBar.style.width = `${progressPercent}%`;
            currentTimeSpan.textContent = formatTime(currentTime);
            durationSpan.textContent = formatTime(duration);
        });
    }

    console.log('Music player initialized successfully');
}
