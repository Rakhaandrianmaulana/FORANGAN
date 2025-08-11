/**
 * PENGELOLA DATABASE ULASAN (LocalStorage)
 * File ini bertanggung jawab untuk semua operasi terkait
 * penyimpanan dan pengambilan data komentar.
 */

const COMMENTS_KEY = 'comments'; // Kunci untuk data di LocalStorage

/**
 * Mengambil semua komentar dari LocalStorage.
 * @returns {Array} Array berisi objek komentar.
 */
export function getComments() {
    const commentsJSON = localStorage.getItem(COMMENTS_KEY);
    return commentsJSON ? JSON.parse(commentsJSON) : [];
}

/**
 * Menyimpan komentar baru ke LocalStorage.
 * @param {string} text - Isi komentar dari pengguna.
 */
export function saveComment(text) {
    const allComments = getComments();
    const newComment = {
        komentar: text,
        tanggal: new Date().toISOString()
    };
    allComments.push(newComment);
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(allComments));
}
