
document.addEventListener('DOMContentLoaded', function() {

    // --- PENGATURAN NAVIGASI ---
    const navButtons = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('main section');
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const page = button.getAttribute('data-page');
            // Sembunyikan semua section
            sections.forEach(section => section.classList.add('hidden'));
            const activeSection = document.getElementById(page);
            if (activeSection) activeSection.classList.remove('hidden');
            // Atur style tombol aktif
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });

    // --- PENGHITUNG PENGUNJUNG ---
    function updateVisitorCount() {
        let count = localStorage.getItem('visitorCount') ? parseInt(localStorage.getItem('visitorCount')) + 1 : 1;
        localStorage.setItem('visitorCount', count);
        const visitorCountElement = document.getElementById('visitor-count');
        if (visitorCountElement) visitorCountElement.textContent = count;
    }

    // --- SISTEM KOMENTAR (ANONIM) ---
    const commentForm = document.getElementById('comment-form');
    const commentList = document.getElementById('comment-list');
    const komentarInput = document.getElementById('komentar');

    function loadComments() {
        const comments = JSON.parse(localStorage.getItem('comments')) || [];
        commentList.innerHTML = '';
        if (comments.length === 0) {
            commentList.innerHTML = '<p class="text-gray-500">Belum ada komentar. Jadilah yang pertama!</p>';
        } else {
            comments.forEach(comment => {
                const commentElement = document.createElement('div');
                commentElement.className = 'bg-white p-4 rounded-lg shadow-sm border border-gray-200';
                commentElement.innerHTML = `
                    <p class="font-bold text-sky-700">Sobat Anak Berkata:</p>
                    <p class="text-gray-600 break-words">${comment.komentar}</p>
                    <p class="text-xs text-gray-400 mt-2">${new Date(comment.tanggal).toLocaleString('id-ID')}</p>
                `;
                commentList.prepend(commentElement);
            });
        }
    }

    if (commentForm) {
        commentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const newComment = {
                komentar: komentarInput.value,
                tanggal: new Date().toISOString()
            };
            const comments = JSON.parse(localStorage.getItem('comments')) || [];
            comments.push(newComment);
            localStorage.setItem('comments', JSON.stringify(comments));
            loadComments();
            commentForm.reset();
        });
    }

    // --- PEMUAT BERITA DARI JSON ---
    async function loadNews() {
        const newsContainer = document.getElementById('news-container');
        if (!newsContainer) return;
        try {
            const response = await fetch('berita.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const newsData = await response.json();
            newsContainer.innerHTML = '';
            if (newsData.length === 0) {
                newsContainer.innerHTML = '<p class="text-gray-500">Saat ini belum ada berita terbaru.</p>';
                return;
            }
            newsData.forEach(item => {
                const article = document.createElement('article');
                article.className = 'bg-white p-5 rounded-lg shadow-sm border border-gray-200';
                article.innerHTML = `
                    <h3 class="text-xl font-bold text-sky-800 mb-2">${item.judul}</h3>
                    <p class="text-sm text-gray-500 mb-3">Dipublikasikan pada: ${new Date(item.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p class="text-gray-700">${item.isi}</p>
                `;
                newsContainer.appendChild(article);
            });
        } catch (error) {
            console.error("Gagal memuat berita:", error);
            newsContainer.innerHTML = '<p class="text-red-500">Maaf, terjadi kesalahan saat memuat berita.</p>';
        }
    }
    
    // --- LOGIKA JINGLE & VIDEO (AGAR TIDAK TABRAKAN) ---
    // Mengambil semua elemen video di halaman
    const allVideos = document.querySelectorAll('video');

    allVideos.forEach(video => {
        // Menambahkan event listener 'play' ke setiap video
        video.addEventListener('play', (event) => {
            // Video yang sedang diputar saat ini
            const currentVideo = event.target;

            // Loop melalui semua video lagi
            allVideos.forEach(otherVideo => {
                // Jika video lain itu BUKAN video yang sedang diputar, dan video itu TIDAK sedang dijeda
                if (otherVideo !== currentVideo && !otherVideo.paused) {
                    // Jeda video lain tersebut
                    otherVideo.pause();
                }
            });
        });
    });


    // --- INISIALISASI SEMUA FUNGSI ---
    updateVisitorCount();
    loadComments();
    loadNews();
});
