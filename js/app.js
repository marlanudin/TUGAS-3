(function () {
    // Daftar template HTML yang akan dimuat oleh aplikasi.
    var templateNames = [
        "login-form.html",
        "app-navbar.html",
        "dashboard-home.html",
        "status-badge.html",
        "stock-table.html",
        "do-tracking.html",
        "order-form.html",
    ];

    // Memuat data bahan ajar, data pengguna, dan seluruh template
    // secara bersamaan sebelum aplikasi Vue dijalankan.
    Promise.all([
        SITTAApi.getJSON("data/dataBahanAjar.json"),
        SITTAApi.getJSON("data/dataPengguna.json"),
        SITTAApi.loadTemplates(templateNames),
    ])
        .then(function (hasil) {
            var dataBahanAjar = hasil[0];
            var dataPengguna = hasil[1];
            var templates = hasil[2];

            // =========================================
            // FILTER GLOBAL VUE
            // Digunakan untuk memformat data pada tampilan.
            // =========================================

            // Mengubah angka menjadi format mata uang Rupiah.
            Vue.filter("rupiah", function (angka) {
                return new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    maximumFractionDigits: 0,
                }).format(Number(angka) || 0);
            });

            // Menambahkan satuan buah pada jumlah stok.
            Vue.filter("buah", function (angka) {
                return (Number(angka) || 0) + " buah";
            });

            // Mengubah tanggal menjadi format tanggal Indonesia.
            Vue.filter("tanggalID", function (nilai) {
                if (!nilai) return "-";

                var tanggal = new Date(nilai + "T00:00:00");

                return tanggal.toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                });
            });

            // =========================================
            // REGISTRASI KOMPONEN VUE
            // Mendaftarkan komponen menggunakan template
            // yang sudah dimuat sebelumnya.
            // =========================================

            registerLoginForm(templates);
            registerAppNavbar(templates);
            registerDashboardHome(templates);
            registerStatusBadge(templates);
            registerStockTable(templates);
            registerDoTracking(templates);
            registerOrderForm(templates);

            // =========================================
            // PEMERIKSAAN STATUS LOGIN
            // Mengambil informasi login dari localStorage.
            // =========================================

            var namaTersimpan = localStorage.getItem("namaUser");
            var statusLogin = localStorage.getItem("isLogin") === "true";

            var userTersimpan = dataPengguna.find(function (u) {
                return u.nama === namaTersimpan;
            });

            // =========================================
            // INISIALISASI ROOT VUE
            // Menjalankan aplikasi pada elemen #app.
            // =========================================

            new Vue({
                el: "#app",

                // Data utama yang digunakan oleh aplikasi.
                data: {
                    initialData: dataBahanAjar,
                    pengguna: dataPengguna,
                    tab: statusLogin ? "dashboard" : "login",
                    currentUser:
                        statusLogin && userTersimpan ? userTersimpan : null,
                    loading: false,
                },

                // Mengatur class pada body sesuai halaman aktif.
                watch: {
                    tab: function (value) {
                        document.body.className =
                            value === "login"
                                ? "login-page"
                                : value === "stok"
                                  ? "stock-page"
                                  : value === "tracking" || value === "order"
                                    ? "tracking-page"
                                    : "";
                    },
                },

                // =====================================
                // METHODS
                // Fungsi utama untuk mengelola aplikasi.
                // =====================================

                methods: {
                    // Memeriksa email dan password pengguna.
                    login: function (form) {
                        var user = this.pengguna.find(function (u) {
                            return (
                                u.email === form.email &&
                                u.password === form.password
                            );
                        });

                        // Menampilkan pesan jika login gagal.
                        if (!user) {
                            SITTAAlert.fire({
                                title: "Login Gagal!",
                                text: "Email atau password salah. Silakan coba lagi.",
                                icon: "error",
                                confirmButtonText: "OK",
                            });

                            return;
                        }

                        // Menyimpan informasi pengguna yang berhasil login.
                        this.currentUser = user;

                        localStorage.setItem("namaUser", user.nama);
                        localStorage.setItem("isLogin", "true");

                        // Menampilkan notifikasi login berhasil.
                        SITTAAlert.fire({
                            title: "Login Berhasil!",
                            text: "Selamat datang, " + user.nama + "!",
                            icon: "success",
                            confirmButtonText: "OK",
                        }).then(() => {
                            this.tab = "dashboard";
                        });
                    },

                    // Mengubah halaman berdasarkan tab yang dipilih.
                    navigate: function (tab) {
                        this.tab = tab;

                        // Mengembalikan posisi halaman ke bagian atas.
                        window.scrollTo({
                            top: 0,
                            behavior: "smooth",
                        });
                    },

                    // Mengakhiri sesi pengguna setelah konfirmasi.
                    logout: function () {
                        var vm = this;

                        SITTAAlert.fire({
                            title: "Logout?",
                            text: "Apakah Anda yakin ingin keluar dari akun?",
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonText: "Ya, Logout",
                            cancelButtonText: "Batal",
                        }).then(function (result) {
                            if (result.isConfirmed) {
                                // Menghapus informasi login dari localStorage.
                                localStorage.removeItem("namaUser");
                                localStorage.removeItem("isLogin");

                                // Mengembalikan aplikasi ke halaman login.
                                vm.currentUser = null;
                                vm.tab = "login";
                            }
                        });
                    },
                },

                // Mengatur class body saat aplikasi pertama kali dimuat.
                mounted: function () {
                    document.body.className =
                        this.tab === "login" ? "login-page" : "";
                },
            });
        })

        // Menangani kesalahan ketika data atau template gagal dimuat.
        .catch(function (error) {
            document.getElementById("app").innerHTML =
                '<div class="app-error"><h2>Aplikasi tidak dapat dimuat</h2><p>' +
                error.message +
                "</p><p>Jalankan proyek melalui Live Server atau server lokal agar fetch JSON dan template dapat digunakan.</p></div>";

            console.error(error);
        });
})();