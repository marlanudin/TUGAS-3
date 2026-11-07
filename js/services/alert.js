// =========================================
// KONFIGURASI SWEETALERT2
// Mengatur tampilan seluruh popup agar sesuai custom
// =========================================

window.SITTAAlert = Swal.mixin({
    // Menghubungkan elemen SweetAlert2 dengan class CSS custom.
    customClass: {
        popup: "stock-popup",
        title: "stock-popup-title",
        htmlContainer: "stock-popup-text",
        confirmButton: "stock-popup-button",
        cancelButton: "stock-popup-cancel",
        input: "stock-popup-input",
    },

    // Menonaktifkan styling bawaan tombol SweetAlert2.
    // Tampilan tombol sepenuhnya mengikuti CSS custom.
    buttonsStyling: false,

    // Membalik posisi tombol konfirmasi dan pembatalan.
    reverseButtons: true,
});