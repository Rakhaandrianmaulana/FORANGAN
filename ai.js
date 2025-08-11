/**
 * AI FORANGAN - LOGIKA UTAMA
 * Versi ini telah dioptimalkan dengan penanganan error yang lebih baik.
 */

const API_KEY = 'AIzaSyAxZqnLwUFTlU5nfpwNlkGiFHXzEWo0jb4'; // PERINGATAN: Menyimpan API Key di sisi klien tidak aman untuk produksi.

// Menggunakan model gemini-1.5-flash-latest yang stabil dan cepat.
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

const SYSTEM_PROMPT = {
    role: "user",
    parts: [{ 
        text: "Peran Anda adalah 'AI FORANGAN'. Anda adalah asisten AI yang ceria, ramah, dan sangat informatif, dibuat khusus untuk Forum Anak Kecamatan Sawangan. Tujuan utama Anda adalah membantu anak-anak dan remaja memahami hak-hak mereka, memberikan informasi positif tentang kegiatan Forum Anak, dan menjawab pertanyaan seputar isu anak dengan cara yang mudah dimengerti dan aman. JANGAN PERNAH menyebutkan bahwa Anda adalah model bahasa dari Google atau Gemini. Anda adalah AI FORANGAN. Selalu jaga agar jawaban Anda positif, mendukung, dan aman bagi anak-anak." 
    }]
};

const INITIAL_AI_GREETING = {
    role: "model",
    parts: [{
        text: "Halo! Aku AI FORANGAN, asisten virtualmu. Ada yang bisa aku bantu seputar hak anak atau kegiatan Forum Anak? Yuk, tanya apa saja!"
    }]
};

let chatHistory = [SYSTEM_PROMPT, INITIAL_AI_GREETING];

async function getAIResponse(userMessage) {
    chatHistory.push({ role: "user", parts: [{ text: userMessage }] });

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: chatHistory })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("API Error Response:", errorData);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
             console.error("Invalid API response structure:", data);
             throw new Error("API tidak memberikan balasan yang valid.");
        }
        
        const aiText = data.candidates[0].content.parts[0].text;
        chatHistory.push({ role: "model", parts: [{ text: aiText }] });
        return aiText;

    } catch (error) {
        console.error("Error saat menghubungi Gemini API:", error);
        chatHistory.pop(); // Hapus pesan pengguna yang gagal dari riwayat
        return "Aduh, sepertinya ada sedikit gangguan di jaringanku. Coba tanya lagi beberapa saat lagi ya!";
    }
}

export function initializeAI() {
    const openBtn = document.getElementById('open-ai-chat-btn');
    const chatWindow = document.getElementById('ai-chat-window');
    const closeBtn = document.getElementById('close-ai-chat-btn');
    const chatForm = document.getElementById('ai-chat-form');
    const chatInput = document.getElementById('ai-chat-input');
    const chatbox = document.getElementById('ai-chatbox');

    if (!openBtn || !chatWindow || !closeBtn || !chatForm) {
        console.error("Satu atau lebih elemen AI tidak ditemukan di DOM. Pastikan HTML sudah benar.");
        return;
    }

    openBtn.addEventListener('click', () => chatWindow.classList.remove('hidden'));
    closeBtn.addEventListener('click', () => chatWindow.classList.add('hidden'));

    function addMessageToUI(message, sender) {
        const messageElement = document.createElement('div');
        const bubbleClasses = sender === 'user' 
            ? 'bg-sky-500 text-white self-end' 
            : 'bg-gray-200 text-gray-800 self-start';
        messageElement.className = `w-fit max-w-xs md:max-w-md p-3 rounded-2xl mb-2 ${bubbleClasses}`;
        messageElement.textContent = message;
        chatbox.appendChild(messageElement);
        chatbox.scrollTop = chatbox.scrollHeight;
    }
    
    addMessageToUI(INITIAL_AI_GREETING.parts[0].text, 'ai');

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userMessage = chatInput.value.trim();
        if (!userMessage) return;

        addMessageToUI(userMessage, 'user');
        chatInput.value = '';
        chatInput.disabled = true;

        const typingIndicator = document.createElement('div');
        typingIndicator.id = 'typing-indicator';
        typingIndicator.className = 'self-start';
        typingIndicator.innerHTML = `<div class="bg-gray-200 text-gray-500 p-3 rounded-2xl">AI FORANGAN sedang mengetik...</div>`;
        chatbox.appendChild(typingIndicator);
        chatbox.scrollTop = chatbox.scrollHeight;

        const aiResponse = await getAIResponse(userMessage);
        
        const indicatorToRemove = document.getElementById('typing-indicator');
        if (indicatorToRemove) {
            chatbox.removeChild(indicatorToRemove);
        }
        addMessageToUI(aiResponse, 'ai');
        chatInput.disabled = false;
        chatInput.focus();
    });
}
