/**
 * LOGIKA KHUSUS UNTUK HALAMAN ADMIN (admin.html)
 * Versi ini telah diperbaiki untuk mencegah loop tak terbatas
 * dan memastikan komentar ditampilkan dengan benar.
 */
import { getComments, saveReply } from './database.js';

// Fungsi untuk membuat elemen HTML untuk satu komentar di dasbor admin
function createAdminCommentElement(comment) {
    const wrapper = document.createElement('div');
    wrapper.className = 'p-4 border border-gray-200 rounded-lg bg-gray-50';

    // Tampilkan komentar asli dari pengguna
    const replyValue = comment.balasan ? comment.balasan.teks : '';
    wrapper.innerHTML = `
        <div class="mb-2">
            <p class="text-sm text-gray-500">Komentar dari Pengguna pada ${new Date(comment.tanggal).toLocaleString('id-ID')}:</p>
            <p class="text-gray-800 italic">"${comment.komentar}"</p>
        </div>
        <form data-comment-id="${comment.id}" class="reply-form mt-4">
            <label for="reply-${comment.id}" class="block text-sm font-medium text-gray-700">Balasan Anda:</label>
            <textarea id="reply-${comment.id}" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm" placeholder="Tulis balasan di sini...">${replyValue}</textarea>
            <div class="flex justify-end items-center mt-2">
                <span class="text-sm text-green-600 font-semibold hidden success-message">Balasan tersimpan!</span>
                <button type="submit" class="ml-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">
                    Simpan Balasan
                </button>
            </div>
        </form>
    `;

    // Tambahkan event listener ke form balasan
    const form = wrapper.querySelector('.reply-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const commentId = form.dataset.commentId;
        const replyText = form.querySelector('textarea').value;
        const successMessage = form.querySelector('.success-message');

        if (replyText.trim()) {
            saveReply(commentId, replyText);
            // Tampilkan pesan sukses
            successMessage.classList.remove('hidden');
            setTimeout(() => {
                successMessage.classList.add('hidden');
            }, 3000); // Sembunyikan setelah 3 detik
        }
    });

    return wrapper;
}

// Fungsi utama untuk menampilkan semua komentar di halaman admin
function displayCommentsForAdmin() {
    const container = document.getElementById('comments-to-reply-container');
    if (!container) return;

    const comments = getComments();
    container.innerHTML = ''; // Kosongkan kontainer sebelum mengisi

    if (comments.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500">Belum ada komentar untuk dibalas.</p>';
        return;
    }

    // Tampilkan komentar dari yang terbaru
    comments.reverse().forEach(comment => {
        const commentElement = createAdminCommentElement(comment);
        container.appendChild(commentElement);
    });
}

// Jalankan fungsi utama saat halaman admin dimuat
document.addEventListener('DOMContentLoaded', displayCommentsForAdmin);
