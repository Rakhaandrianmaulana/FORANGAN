/**
 * PENGELOLA DATABASE ULASAN (LocalStorage)
 * File ini bertanggung jawab untuk semua operasi terkait
 * penyimpanan dan pengambilan data komentar dan balasan.
 */

const COMMENTS_KEY = 'comments';

/**
 * Mengambil semua komentar dari LocalStorage.
 * @returns {Array} Array berisi objek komentar.
 */
export function getComments() {
    const commentsJSON = localStorage.getItem(COMMENTS_KEY);
    // Pastikan selalu mengembalikan array, bahkan jika localStorage kosong
    try {
        const parsed = JSON.parse(commentsJSON);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
}

/**
 * Menyimpan komentar baru dari pengguna.
 * @param {string} text - Isi komentar dari pengguna.
 */
export function saveComment(text) {
    const allComments = getComments();
    const newComment = {
        id: Date.now().toString(), // ID unik berdasarkan waktu
        komentar: text,
        tanggal: new Date().toISOString(),
        balasan: null // Balasan awalnya kosong
    };
    allComments.push(newComment);
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(allComments));
}

/**
 * Menyimpan atau memperbarui balasan dari admin.
 * @param {string} commentId - ID dari komentar yang akan dibalas.
 * @param {string} replyText - Isi balasan dari admin.
 */
export function saveReply(commentId, replyText) {
    const allComments = getComments();
    const commentIndex = allComments.findIndex(c => c.id === commentId);

    if (commentIndex > -1) {
        allComments[commentIndex].balasan = {
            teks: replyText,
            tanggal: new Date().toISOString()
        };
        localStorage.setItem(COMMENTS_KEY, JSON.stringify(allComments));
    } else {
        console.error(`Komentar dengan ID ${commentId} tidak ditemukan.`);
    }
}
