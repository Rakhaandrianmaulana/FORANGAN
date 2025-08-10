document.addEventListener('DOMContentLoaded', function() {

    // --- PENGATURAN NAVIGASI ---
    const navButtons = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('main section');
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const page = button.getAttribute('data-page');
            sections.forEach(section => section.classList.add('hidden'));
            const activeSection = document.getElementById(page);
            if (activeSection) activeSection.classList.remove('hidden');
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });

    // --- PENGHITUNG PENGUNJUNG ---
    // (Tidak ada perubahan, kode tetap sama)

    // --- SISTEM KOMENTAR (ANONIM) ---
    // (Tidak ada perubahan, kode tetap sama)
    
    // --- LOGIKA MODAL (JENDELA POP-UP) UNTUK BERITA ---
    const modal = document.getElementById('news-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const closeModalBtn = document.getElementById('close-modal-btn');

    function openModal(title, content) {
        modalTitle.textContent = title;
        modalBody.textContent = content;
        modal.classList.remove('hidden');
    }

    function closeModal() {
        modal.classList.add('hidden');
    }

    if (modal) {
        closeModalBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // --- PEMUAT BERITA DARI JSON (DENGAN CUPLIKAN) ---
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

                const snippet = item.isi.length > 150 ? item.isi.substring(0, 150) + '...' : item.isi;

                let readMoreButton = '';
                if (item.isi.length > 150) {
                    readMoreButton = `<button class="text-sky-600 font-bold hover:underline mt-2 inline-block read-more-btn">Baca Selengkapnya...</button>`;
                }

                article.innerHTML = `
                    <h3 class="text-xl font-bold text-sky-800 mb-2">${item.judul}</h3>
                    <p class="text-sm text-gray-500 mb-3">Dipublikasikan pada: ${new Date(item.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p class="text-gray-700">${snippet}</p>
                    ${readMoreButton}
                `;
                
                newsContainer.appendChild(article);

                // Tambahkan event listener ke tombol jika ada
                if (readMoreButton) {
                    article.querySelector('.read-more-btn').addEventListener('click', () => {
                        openModal(item.judul, item.isi);
                    });
                }
            });
        } catch (error) {
            console.error("Gagal memuat berita:", error);
            newsContainer.innerHTML = '<p class="text-red-500">Maaf, terjadi kesalahan saat memuat berita.</p>';
        }
    }
    
    // --- PEMUAT INFO HUKUM DARI JSON BARU ---
    async function loadHukum() {
        const hukumContainer = document.getElementById('hukum-container');
        if (!hukumContainer) return;
        try {
            const response = await fetch('hukum.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
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

    // --- LOGIKA JINGLE & VIDEO (AGAR TIDAK TABRAKAN) ---
    // (Tidak ada perubahan, kode tetap sama)


    // --- INISIALISASI SEMUA FUNGSI ---
    // (Kode inisialisasi seperti updateVisitorCount, loadComments, dll, tetap sama)
    loadNews();
    loadHukum(); // Panggil fungsi baru
});
