// =========================================
// KOMPONEN DASHBOARD HOME
// Menampilkan sapaan pengguna berdasarkan
// waktu saat dashboard dibuka.
// =========================================

window.registerDashboardHome = function (tpl) {
    Vue.component("dashboard-home", {
        // Menerima nama pengguna dari komponen utama.
        props: ["namaUser"],

        // Menggunakan template HTML dari folder templates.
        template: tpl["dashboard-home.html"],

        // =====================================
        // COMPUTED
        // Menentukan sapaan berdasarkan waktu.
        // =====================================

        computed: {
            sapaan: function () {
                var h = new Date().getHours();

                if (h < 11) return "Selamat Pagi";
                if (h < 15) return "Selamat Siang";
                if (h < 19) return "Selamat Sore";

                return "Selamat Malam";
            },
        },
    });
};