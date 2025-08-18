export function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg text-white z-50 ${
        type === 'error' ? 'bg-red-500' :
        type === 'success' ? 'bg-green-500' :
        'bg-blue-500'
    }`;
    toast.textContent = message;
    toast.style.display = 'block';
    setTimeout(() => {
        toast.textContent = '';
        toast.style.display = 'none';
        toast.className = '';
    }, 3000);
}
