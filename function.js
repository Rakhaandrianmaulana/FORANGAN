// Mengimpor aset dan fungsi database dari file eksternal
import { siteAssets } from './assets.js';
import { getComments, saveComment } from './database.js';

// Fungsi utama yang akan dijalankan setelah seluruh halaman dimuat
function main() {
    /**
     * Memuat semua aset media dari assets.js ke elemen HTML.
     */
    function loadAllAssets() {
        // Atur gambar latar belakang
        document.body.style.backgroundImage = `url('${siteAssets.backgroundCloud1}'), url('${siteAssets.backgroundCloud2}')`;
        document.body.style.backgroundPosition = 'top -10% left -10%, bottom -10% right -10%';
        document.body.style.backgroundRepeat = 'no-repeat';
        document.body.style.backgroundSize = '50%, 50%';

        // Muat semua aset gambar dan video
        const assetElements = document.querySelectorAll('[data-asset]');
        assetElements.forEach(el => {
            const assetKey = el.dataset.asset;
            if (siteAssets[assetKey]) {
                el.src = siteAssets[assetKey];

                // === PERBAIKAN KRITIS UNTUK VIDEO ===
                // Jika elemen adalah <source>, paksa elemen <video> induknya
                // untuk memuat ulang sumber media yang baru.
                if (el.tagName === 'SOURCE') {
                    const videoElement = el.parentElement;
                    if (videoElement && typeof videoElement.load === 'function') {
                        videoElement.load();
                    }
                }
            } else {
                console.warn(`Aset dengan kunci "${assetKey}" tidak ditemukan di assets.js`);
            }
        });
    }

    /**
     * Mengatur navigasi antar halaman/section.
     */
    function setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-link');
        const sections = document.querySelectorAll('main section');
        
        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const pageId = button.dataset.page;
                
                sections.forEach(section => {
                    section.classList.remove('active-section');
                    section.classList.add('hidden-section');
                });
                
                const targetSection = document.getElementById(pageId);
                if (targetSection) {
                    targetSection.classList.remove('hidden-section');
                    targetSection.classList.add('active-section');
                }
                
                navButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });
    }

    /**
     * Memperbarui dan menampilkan jumlah pengunjung.
     */
    function updateVisitorCount() {
        let count = localStorage.getItem('visitorCount') ? parseInt(localStorage.getItem('visitorCount')) + 1 : 1;
        localStorage.setItem('visitorCount', count);
        const visitorCountElement = document.getElementById('visitor-count');
        if (visitorCountElement) visitorCountElement.textContent = count;
    }

    /**
     * Mengatur fungsionalitas halaman ulasan.
     */
    function setupCommentSection() {
        const commentForm = document.getElementById('comment-form');
        const commentList = document.getElementById('comment-list');
        const komentarInput = document.getElementById('komentar');

        function displayComments() {
            const comments = getComments();
            commentList.innerHTML = '';
            if (comments.length === 0) {
                commentList.innerHTML = '<p class="text-gray-500">Belum ada komentar. Jadilah yang pertama!</p>';
            } else {
                comments.reverse().forEach(comment => {
                    const commentElement = document.createElement('div');
                    commentElement.className = 'bg-white p-4 rounded-lg shadow-sm border border-gray-200';
                    commentElement.innerHTML = `
                        <p class="font-bold text-sky-700">Sobat Anak Berkata:</p>
                        <p class="text-gray-600 break-words">${comment.komentar}</p>
                        <p class="text-xs text-gray-400 mt-2">${new Date(comment.tanggal).toLocaleString('id-ID')}</p>
                    `;
                    commentList.appendChild(commentElement);
                });
            }
        }

        if (commentForm) {
            commentForm.addEventListener('submit', function(e) {
                e.preventDefault();
                if (komentarInput.value.trim()) {
                    saveComment(komentarInput.value);
                    displayComments();
                    commentForm.reset();
                }
            });
        }
        
        displayComments();
    }
    
    /**
     * Mengatur logika modal (pop-up) untuk berita.
     */
    function setupNewsModal() {
        const modal = document.getElementById('news-modal');
        if (!modal) return;
        
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        const closeModalBtn = document.getElementById('close-modal-btn');

        window.openModal = (title, content) => {
            modalTitle.textContent = title;
            modalBody.textContent = content;
            modal.classList.remove('hidden');
        };

        const closeModal = () => modal.classList.add('hidden');
        closeModalBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    /**
     * Memuat berita dari berita.json dengan sistem "Baca Selengkapnya".
     */
    async function loadNews() {
        const newsContainer = document.getElementById('news-container');
        if (!newsContainer) return;
        try {
            const response = await fetch('berita.json');
            if (!response.ok) throw new Error(`Fetch error! status: ${response.status}`);
            const newsData = await response.json();
            newsContainer.innerHTML = '';
            if (newsData.length === 0) {
                newsContainer.innerHTML = '<p class="text-gray-500">Saat ini belum ada berita terbaru.</p>';
                return;
            }
            newsData.forEach(item => {
                const article = document.createElement('article');
                article.className = 'bg-white p-5 rounded-lg shadow-sm border border-gray-200';
                const snippet = item.isi.length > 150 ? item.isi.substring(0, 150) + '...' : item.isi;
                const readMoreButton = item.isi.length > 150 ? `<button class="text-sky-600 font-bold hover:underline mt-2 inline-block">Baca Selengkapnya...</button>` : '';
                
                article.innerHTML = `
                    <h3 class="text-xl font-bold text-sky-800 mb-2">${item.judul}</h3>
                    <p class="text-sm text-gray-500 mb-3">Dipublikasikan pada: ${new Date(item.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p class="text-gray-700">${snippet}</p>
                    ${readMoreButton}
                `;
                
                if (readMoreButton) {
                    article.querySelector('button').addEventListener('click', () => window.openModal(item.judul, item.isi));
                }
                newsContainer.appendChild(article);
            });
        } catch (error) {
            console.error("Gagal memuat berita:", error);
            newsContainer.innerHTML = '<p class="text-red-500">Maaf, terjadi kesalahan saat memuat berita.</p>';
        }
    }
    
    /**
     * Memuat informasi hukum dari hukum.json.
     */
    async function loadHukum() {
        const hukumContainer = document.getElementById('hukum-container');
        if (!hukumContainer) return;
        try {
            const response = await fetch('hukum.json');
            if (!response.ok) throw new Error(`Fetch error! status: ${response.status}`);
            const hukumData = await response.json();
            hukumContainer.innerHTML = '';
            hukumData.forEach(kategori => {
                const detailsElement = document.createElement('details');
                detailsElement.className = 'bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden';
                let pointsHTML = '';
                if (kategori.poin && kategori.poin.length > 0) {
                    pointsHTML = '<ul class="list-disc list-inside space-y-2 mt-2">';
                    kategori.poin.forEach(p => {
                        pointsHTML += `<li><strong>${p.pasal}:</strong> ${p.isi}</li>`;
                    });
                    pointsHTML += '</ul>';
                }
                detailsElement.innerHTML = `
                    <summary class="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-100">
                        <span class="font-bold text-lg text-gray-700">${kategori.kategori}</span>
                        <svg class="w-6 h-6 text-gray-500 transition-transform transform arrow-down" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                    </summary>
                    <div class="p-4 border-t border-gray-200">
                        <p class="mb-3">${kategori.deskripsi}</p>
                        ${pointsHTML}
                    </div>
                `;
                hukumContainer.appendChild(detailsElement);
            });
        } catch (error) {
            console.error("Gagal memuat info hukum:", error);
            hukumContainer.innerHTML = '<p class="text-red-500">Maaf, terjadi kesalahan saat memuat informasi hukum.</p>';
        }
    }

    /**
     * Memastikan hanya satu video yang bisa diputar dalam satu waktu.
     */
    function setupVideoPlayerLogic() {
        const allVideos = document.querySelectorAll('video');
        allVideos.forEach(video => {
            video.addEventListener('play', (event) => {
                allVideos.forEach(otherVideo => {
                    if (otherVideo !== event.target && !otherVideo.paused) {
                        otherVideo.pause();
                    }
                });
            });
        });
    }

    // --- INISIALISASI SEMUA FUNGSI ---
    loadAllAssets();
    setupNavigation();
    updateVisitorCount();
    setupCommentSection();
    setupNewsModal();
    loadNews();
    loadHukum();
    setupVideoPlayerLogic();
}

// Menjalankan fungsi utama setelah halaman siap
document.addEventListener('DOMContentLoaded', main);
