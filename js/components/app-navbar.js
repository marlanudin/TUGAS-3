// =========================================
// KOMPONEN APP NAVBAR
// Menampilkan navigasi utama aplikasi SITTA UT.
// =========================================

window.registerAppNavbar = function (tpl) {
    Vue.component("app-navbar", {
        // Menerima informasi tab aktif dari komponen utama.
        props: ["tab"],

        // Menggunakan template HTML dari folder templates.
        template: tpl["app-navbar.html"],
    });
};