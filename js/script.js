// ============ Video Modal Control ============
let videoEndTime = null;
let timeUpdateListener = null;
let seekingListener = null;

function openVideoModal(videoSrc, startTime = 0, endTime = null) {
    console.log('Opening video:', videoSrc, 'Start:', startTime, 'End:', endTime);
    
    const modal = document.getElementById('videoModal');
    const video = document.getElementById('modalVideo');
    const source = document.getElementById('videoSource');
    
    // Cleanup previous state
    video.pause();
    video.currentTime = 0;
    
    // Remove old event listeners
    if (timeUpdateListener) {
        video.removeEventListener('timeupdate', timeUpdateListener);
    }
    if (seekingListener) {
        video.removeEventListener('seeking', seekingListener);
    }
    
    // Set new source and load
    source.src = videoSrc;
    video.load();
    
    // Store end time
    videoEndTime = endTime;
    
    // Show modal
    modal.style.display = 'flex';
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Wait for video metadata to load
    video.onloadedmetadata = function() {
        console.log('Video loaded, duration:', video.duration);
        
        // Set start time
        if (startTime > 0) {
            video.currentTime = startTime;
        }
        
        // Attempt to play video
        const playPromise = video.play();
        
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    console.log('Video playing successfully');
                })
                .catch(error => {
                    console.error('Error playing video:', error);
                    // Alert if Autoplay is blocked
                    alert('ไม่สามารถเล่นวิดีโอได้อัตโนมัติ กรุณาคลิกปุ่ม Play ⏯️ ในหน้าต่างวิดีโอ');
                });
        }
    };
    
    video.onerror = function() {
        console.error('Error loading video');
        alert('ไม่สามารถโหลดวิดีโอได้ กรุณาตรวจสอบ path ของไฟล์');
    };
    
    // Add new event listeners for time control
    timeUpdateListener = function() {
        if (videoEndTime !== null && this.currentTime >= videoEndTime) {
            this.pause();
            this.currentTime = videoEndTime;
        }
    };
    
    seekingListener = function() {
        if (videoEndTime !== null && this.currentTime > videoEndTime) {
            this.currentTime = videoEndTime;
        }
    };
    
    video.addEventListener('timeupdate', timeUpdateListener);
    video.addEventListener('seeking', seekingListener);
}

function closeVideoModal() {
    const modal = document.getElementById('videoModal');
    const video = document.getElementById('modalVideo');
    const source = document.getElementById('videoSource');
    
    video.pause();
    video.currentTime = 0;
    source.src = '';
    videoEndTime = null;
    
    // Remove event listeners
    if (timeUpdateListener) {
        video.removeEventListener('timeupdate', timeUpdateListener);
    }
    if (seekingListener) {
        video.removeEventListener('seeking', seekingListener);
    }
    
    modal.style.display = 'none';
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside the video
document.getElementById('videoModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeVideoModal();
    }
});

// Close modal when pressing ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeVideoModal();
    }
});

// ============ Event Listeners and Utilities ============

// Scroll Progress Bar & Back to Top Button
window.addEventListener('scroll', () => {
    const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (window.scrollY / windowHeight) * 100;
    document.getElementById('progressBar').style.width = scrolled + '%';
    
    // Back to Top Button visibility
    const backToTop = document.getElementById('backToTop');
    if (window.scrollY > 500) {
        backToTop.classList.remove('opacity-0', 'pointer-events-none');
        backToTop.classList.add('opacity-100');
    } else {
        backToTop.classList.add('opacity-0', 'pointer-events-none');
        backToTop.classList.remove('opacity-100');
    }
});

// Back to Top Functionality
document.getElementById('backToTop').addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Smooth Scroll for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            // Close mobile menu if open
            document.getElementById('mobileMenu').classList.remove('active');
            document.body.style.overflow = 'auto'; // Restore scroll
            
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const closeMobileMenu = document.getElementById('closeMobileMenu');

mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.add('active');
    document.body.style.overflow = 'hidden';
});

closeMobileMenu.addEventListener('click', () => {
    mobileMenu.classList.remove('active');
    document.body.style.overflow = 'auto';
});

// Close mobile menu when clicking on a link
document.querySelectorAll('#mobileMenu a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
});

// Intersection Observer for Fade-in Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px' // Start fade-in 100px before reaching viewport
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target); // Stop observing after animation runs once
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in-up, .fade-in').forEach(el => {
    el.style.opacity = '0'; // Initial state for JS-based fade-in
    el.style.transform = 'translateY(50px)'; // Initial state for JS-based fade-in
    el.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out'; // Add transition property for JS control
    observer.observe(el);
});

// Active Navigation on Scroll
window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        // Use a smaller offset for a better feel on scroll
        const offset = 200; 
        if (scrollY >= (sectionTop - offset)) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});