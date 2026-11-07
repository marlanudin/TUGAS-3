// =========================================
// KOMPONEN FORM LOGIN
// Mengelola input email, password, dan
// informasi bantuan untuk pengguna.
// =========================================

window.registerLoginForm = function (tpl) {
    Vue.component("login-form", {
        // Data pengguna diterima dari komponen utama.
        props: ["pengguna"],

        // Menggunakan template HTML dari folder templates.
        template: tpl["login-form.html"],

        // =====================================
        // DATA KOMPONEN
        // Menyimpan input login dan kondisi
        // untuk menampilkan atau menyembunyikan password.
        // =====================================

        data: function () {
            return {
                form: {
                    email: "",
                    password: "",
                },

                lihatPassword: false,
            };
        },

        // =====================================
        // METHODS
        // Fungsi untuk menampilkan informasi
        // bantuan kepada pengguna.
        // =====================================

        methods: {
            // Menampilkan informasi ketika pengguna lupa password.
            infoLupa: function () {
                SITTAAlert.fire({
                    title: "Lupa Password?",
                    text: "Silakan hubungi admin UT untuk reset password.",
                    icon: "info",
                    confirmButtonText: "OK",
                });
            },

            // Menampilkan informasi bagi pengguna yang belum memiliki akun.
            infoDaftar: function () {
                SITTAAlert.fire({
                    title: "Belum Punya Akun?",
                    text: "Silakan hubungi admin UT untuk mendapatkan akses akun.",
                    icon: "info",
                    confirmButtonText: "OK",
                });
            },
        },
    });
};