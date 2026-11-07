// =========================================
// KOMPONEN FORM PEMESANAN BAHAN AJAR
// Mengelola formulir pemesanan, pemilihan paket,
// dan daftar pesanan yang dibuat pengguna.
// =========================================

window.registerOrderForm = function (tpl) {
    Vue.component("order-form", {
        // Data awal diterima dari komponen utama.
        props: ["initialData"],

        // Menggunakan template HTML dari folder templates.
        template: tpl["order-form.html"],

        // =====================================
        // DATA KOMPONEN
        // Menyimpan data paket, stok, formulir,
        // dan daftar pesanan.
        // =====================================

        data: function () {
            return {
                paketList: this.initialData.paket,
                stok: this.initialData.stok,

                // Data formulir pemesanan.
                form: {
                    nim: "",
                    nama: "",
                    kodePaket: "",
                },

                // Menyimpan pesanan yang telah dibuat.
                daftarPesanan: [],
            };
        },

        // =====================================
        // COMPUTED PROPERTIES
        // Menentukan paket yang dipilih pengguna.
        // =====================================

        computed: {
            paketDipilih: function () {
                return (
                    this.paketList.find(
                        (p) => p.kode === this.form.kodePaket
                    ) || null
                );
            },
        },

        // =====================================
        // METHODS
        // Fungsi untuk mengelola pemesanan.
        // =====================================

        methods: {
            // Mengubah angka menjadi format mata uang Rupiah.
            formatRupiah: function (n) {
                return new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    maximumFractionDigits: 0,
                }).format(Number(n) || 0);
            },

            // Mencari judul bahan ajar berdasarkan kode.
            judulBahan: function (k) {
                var x = this.stok.find((y) => y.kode === k);

                return x ? x.judul : "Judul tidak ditemukan";
            },

            // Membuat pesanan berdasarkan data formulir.
            buatPesanan: function () {
                // Memeriksa kelengkapan data sebelum membuat pesanan.
                if (
                    !this.form.nim.trim() ||
                    !this.form.nama.trim() ||
                    !this.paketDipilih
                ) {
                    SITTAAlert.fire({
                        icon: "warning",
                        title: "Data belum lengkap",
                    });

                    return;
                }

                // Mengambil informasi paket yang dipilih.
                var p = this.paketDipilih;

                // Menambahkan pesanan ke dalam daftar.
                this.daftarPesanan.push({
                    nomor:
                        "PSN-" +
                        String(this.daftarPesanan.length + 1).padStart(3, "0"),

                    nim: this.form.nim.trim(),
                    nama: this.form.nama.trim(),
                    paket: p.kode + " - " + p.nama,
                    total: p.harga,
                    tanggal: new Date().toLocaleDateString("id-ID"),
                    status: "Menunggu diproses",
                });

                // Menampilkan notifikasi bahwa pesanan berhasil dibuat.
                SITTAAlert.fire({
                    icon: "success",
                    title: "Pesanan dibuat",
                });

                // Mengosongkan formulir setelah pesanan dibuat.
                this.form = {
                    nim: "",
                    nama: "",
                    kodePaket: "",
                };
            },
        },
    });
};