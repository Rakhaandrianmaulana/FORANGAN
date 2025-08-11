import { siteAssets } from './assets.js';
import { getComments, saveComment } from './database.js';
import { initializeAI } from './ai.js';

function main() {
    function loadAllAssets() {
        document.body.style.backgroundImage = `url('${siteAssets.backgroundCloud1}'), url('${siteAssets.backgroundCloud2}')`;
        document.body.style.backgroundPosition = 'top -10% left -10%, bottom -10% right -10%';
        document.body.style.backgroundRepeat = 'no-repeat';
        document.body.style.backgroundSize = '50%, 50%';
        const assetElements = document.querySelectorAll('[data-asset]');
        assetElements.forEach(el => {
            const assetKey = el.dataset.asset;
            if (siteAssets[assetKey]) {
                el.src = siteAssets[assetKey];
                if (el.tagName === 'SOURCE') {
                    const videoElement = el.parentElement;
                    if (videoElement && typeof videoElement.load === 'function') videoElement.load();
                }
            }
        });
    }

    function setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-link');
        const sections = document.querySelectorAll('main section');
        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const pageId = button.dataset.page;
                sections.forEach(section => { section.classList.remove('active-section'); section.classList.add('hidden-section'); });
                const targetSection = document.getElementById(pageId);
                if (targetSection) { targetSection.classList.remove('hidden-section'); targetSection.classList.add('active-section'); }
                navButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });
    }

    function updateVisitorCount() {
        let count = localStorage.getItem('visitorCount') ? parseInt(localStorage.getItem('visitorCount')) + 1 : 1;
        localStorage.setItem('visitorCount', count);
        const visitorCountElement = document.getElementById('visitor-count');
        if (visitorCountElement) visitorCountElement.textContent = count;
    }

    function setupCommentSection() {
        const commentForm = document.getElementById('comment-form');
        const commentList = document.getElementById('comment-list');
        const komentarInput = document.getElementById('komentar');
        function displayComments() {
            const comments = getComments();
            commentList.innerHTML = '';
            if (comments.length === 0) { commentList.innerHTML = '<p class="text-gray-500">Belum ada komentar. Jadilah yang pertama!</p>'; return; }
            comments.reverse().forEach(comment => {
                const wrapper = document.createElement('div');
                wrapper.className = 'bg-white p-4 rounded-lg shadow-sm border border-gray-200';
                let userCommentHTML = `<div><p class="font-bold text-sky-700">Sobat Anak Berkata:</p><p class="text-gray-600 break-words italic">"${comment.komentar}"</p><p class="text-xs text-gray-400 mt-2">${new Date(comment.tanggal).toLocaleString('id-ID')}</p></div>`;
                let adminReplyHTML = '';
                if (comment.balasan) { adminReplyHTML = `<div class="mt-4 pt-4 border-t border-sky-100 ml-4"><div class="flex items-center gap-2"><p class="font-bold text-green-600">FORANGAN</p><svg class="w-5 h-5 text-sky-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg></div><p class="text-gray-800 break-words">${comment.balasan.teks}</p><p class="text-xs text-gray-400 mt-2">${new Date(comment.balasan.tanggal).toLocaleString('id-ID')}</p></div>`; }
                wrapper.innerHTML = userCommentHTML + adminReplyHTML;
                commentList.appendChild(wrapper);
            });
        }
        if (commentForm) {
            commentForm.addEventListener('submit', function(e) {
                e.preventDefault();
                if (komentarInput.value.trim()) { saveComment(komentarInput.value); displayComments(); commentForm.reset(); }
            });
        }
        displayComments();
    }
    
    function setupNewsModal() {
        const modal = document.getElementById('news-modal');
        if (!modal) return;
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');
        const closeModalBtn = document.getElementById('close-modal-btn');
        window.openModal = (title, content) => { modalTitle.textContent = title; modalBody.textContent = content; modal.classList.remove('hidden'); };
        const closeModal = () => modal.classList.add('hidden');
        closeModalBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    }

    async function loadNews() {
        const newsContainer = document.getElementById('news-container');
        if (!newsContainer) return;
        try {
            const response = await fetch('berita.json');
            if (!response.ok) throw new Error(`Fetch error!`);
            const newsData = await response.json();
            newsContainer.innerHTML = '';
            if (newsData.length === 0) { newsContainer.innerHTML = '<p class="text-gray-500">Saat ini belum ada berita terbaru.</p>'; return; }
            newsData.forEach(item => {
                const article = document.createElement('article');
                article.className = 'bg-white p-5 rounded-lg shadow-sm border border-gray-200';
                const snippet = item.isi.length > 150 ? item.isi.substring(0, 150) + '...' : item.isi;
                const readMoreButton = item.isi.length > 150 ? `<button class="text-sky-600 font-bold hover:underline mt-2 inline-block">Baca Selengkapnya...</button>` : '';
                article.innerHTML = `<h3 class="text-xl font-bold text-sky-800 mb-2">${item.judul}</h3><p class="text-sm text-gray-500 mb-3">Dipublikasikan pada: ${new Date(item.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p><p class="text-gray-700">${snippet}</p>${readMoreButton}`;
                if (readMoreButton) { article.querySelector('button').addEventListener('click', () => window.openModal(item.judul, item.isi)); }
                newsContainer.appendChild(article);
            });
        } catch (error) { console.error("Gagal memuat berita:", error); newsContainer.innerHTML = '<p class="text-red-500">Maaf, terjadi kesalahan saat memuat berita.</p>'; }
    }
    
    async function loadHukum() {
        const hukumContainer = document.getElementById('hukum-container');
        if (!hukumContainer) return;
        try {
            const response = await fetch('hukum.json');
            if (!response.ok) throw new Error(`Fetch error!`);
            const hukumData = await response.json();
            hukumContainer.innerHTML = '';
            hukumData.forEach(kategori => {
                const detailsElement = document.createElement('details');
                detailsElement.className = 'bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden';
                let pointsHTML = '';
                if (kategori.poin && kategori.poin.length > 0) {
                    pointsHTML = '<ul class="list-disc list-inside space-y-2 mt-2">';
                    kategori.poin.forEach(p => { pointsHTML += `<li><strong>${p.pasal}:</strong> ${p.isi}</li>`; });
                    pointsHTML += '</ul>';
                }
                detailsElement.innerHTML = `<summary class="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-100"><span class="font-bold text-lg text-gray-700">${kategori.kategori}</span><svg class="w-6 h-6 text-gray-500 transition-transform transform arrow-down" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg></summary><div class="p-4 border-t border-gray-200"><p class="mb-3">${kategori.deskripsi}</p>${pointsHTML}</div>`;
                hukumContainer.appendChild(detailsElement);
            });
        } catch (error) { console.error("Gagal memuat info hukum:", error); hukumContainer.innerHTML = '<p class="text-red-500">Maaf, terjadi kesalahan saat memuat informasi hukum.</p>'; }
    }

    function setupVideoPlayerLogic() {
        const allVideos = document.querySelectorAll('video');
        allVideos.forEach(video => {
            video.addEventListener('play', (event) => {
                allVideos.forEach(otherVideo => { if (otherVideo !== event.target && !otherVideo.paused) otherVideo.pause(); });
            });
        });
    }

    loadAllAssets();
    setupNavigation();
    updateVisitorCount();
    setupCommentSection();
    setupNewsModal();
    loadNews();
    loadHukum();
    setupVideoPlayerLogic();
    initializeAI();
}

document.addEventListener('DOMContentLoaded', main);
