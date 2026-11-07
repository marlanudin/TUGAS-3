// =========================================
// KOMPONEN DELIVERY ORDER (DO) TRACKING
// Mengelola pembuatan Delivery Order,
// pencarian DO, dan pembaruan status pengiriman.
// =========================================

window.registerDoTracking = function (tpl) {
    Vue.component("do-tracking", {
        // Menerima data awal dari komponen utama.
        props: ["initialData"],

        // Menggunakan template HTML dari folder templates.
        template: tpl["do-tracking.html"],

        // =====================================
        // DATA KOMPONEN
        // Menyimpan data paket, stok, ekspedisi,
        // daftar DO, dan formulir pengiriman.
        // =====================================

        data: function () {
            var src = this.initialData;

            return {
                upbjjList: src.upbjjList,
                paketList: src.paket,
                stok: src.stok,
                ekspedisiList: src.pengirimanList,

                // Mengubah data tracking berbentuk objek
                // menjadi array agar mudah ditampilkan.
                daftarDO: Object.keys(src.tracking).map(function (nomor) {
                    var x = src.tracking[nomor];

                    // Mencari nama paket berdasarkan kode paket.
                    var p = src.paket.find((y) => y.kode === x.paket);

                    return {
                        nomorDO: nomor,
                        nim: x.nim,
                        nama: x.nama,
                        ekspedisi: x.ekspedisi,
                        kodePaket: x.paket,
                        namaPaket: p ? p.nama : "",
                        tanggalKirim: x.tanggalKirim,
                        total: x.total,
                        status: x.status,
                        perjalanan: x.perjalanan || [],
                    };
                }),

                // Kata kunci untuk pencarian DO.
                kataKunci: "",

                // Menyimpan DO yang sedang dipilih.
                selectedDO: null,

                // Formulir pembuatan Delivery Order.
                form: {
                    nim: "",
                    nama: "",
                    ekspedisi: "",
                    kodePaket: "",
                    tanggalKirim: this.tanggalHariIni(),
                },

                // Formulir untuk menambahkan progres pengiriman.
                formProgress: {
                    keterangan: "",
                },

                // Menyimpan pesan kesalahan validasi.
                errors: [],
            };
        },

        // =====================================
        // COMPUTED
        // Mengolah data secara otomatis ketika
        // data yang menjadi ketergantungannya berubah.
        // =====================================

        computed: {
            // Membuat nomor DO berikutnya berdasarkan
            // tahun berjalan dan nomor DO terbesar.
            nomorDOBaru: function () {
                var y = new Date().getFullYear();
                var prefix = "DO" + y + "-";

                var max = this.daftarDO.reduce(function (m, x) {
                    if (x.nomorDO.indexOf(prefix) !== 0) return m;

                    var n = parseInt(x.nomorDO.slice(prefix.length), 10);

                    return Number.isFinite(n) ? Math.max(m, n) : m;
                }, 1);

                return prefix + String(max + 1).padStart(4, "0");
            },

            // Mengambil data paket berdasarkan pilihan pengguna.
            paketDipilih: function () {
                return (
                    this.paketList.find(
                        (x) => x.kode === this.form.kodePaket
                    ) || null
                );
            },

            // Menghitung total harga berdasarkan paket yang dipilih.
            totalHarga: function () {
                return this.paketDipilih ? this.paketDipilih.harga : 0;
            },

            // Menampilkan daftar DO berdasarkan nomor DO atau NIM.
            daftarDOFilter: function () {
                var k = this.kataKunci.toLowerCase();

                return this.daftarDO.filter(
                    (x) =>
                        !k ||
                        x.nomorDO.toLowerCase().includes(k) ||
                        x.nim.toLowerCase().includes(k)
                );
            },

            // Menghitung ringkasan jumlah Delivery Order
            // berdasarkan keseluruhan dan status pengiriman.
            ringkasanDO: function () {
                return {
                    "Total Delivery Order": this.daftarDO.length,

                    "Dalam Perjalanan": this.daftarDO.filter(
                        (x) => x.status === "Dalam Perjalanan"
                    ).length,

                    Diproses: this.daftarDO.filter(
                        (x) => x.status === "Diproses"
                    ).length,
                };
            },
        },

        // =====================================
        // METHODS
        // Berisi fungsi untuk mengelola tanggal,
        // pencarian, pembuatan DO, dan progres pengiriman.
        // =====================================

        methods: {
            // Menghasilkan tanggal hari ini dengan format YYYY-MM-DD.
            tanggalHariIni: function () {
                var d = new Date();

                return (
                    d.getFullYear() +
                    "-" +
                    String(d.getMonth() + 1).padStart(2, "0") +
                    "-" +
                    String(d.getDate()).padStart(2, "0")
                );
            },

            // Mengubah angka menjadi format mata uang Rupiah.
            formatRupiah: function (n) {
                return new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    maximumFractionDigits: 0,
                }).format(Number(n) || 0);
            },

            // Mengubah tanggal menjadi format Indonesia.
            formatTanggal: function (v) {
                if (!v) return "-";

                var d = new Date(v + "T00:00:00");

                return d.toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                });
            },

            // Mencari judul bahan ajar berdasarkan kode bahan ajar.
            judulBahan: function (k) {
                var x = this.stok.find((y) => y.kode === k);

                return x ? x.judul : "Judul tidak ditemukan";
            },

            // Memilih DO secara otomatis jika hasil pencarian
            // hanya menemukan satu data.
            cariDO: function () {
                this.selectedDO =
                    this.daftarDOFilter.length === 1
                        ? this.daftarDOFilter[0]
                        : null;
            },

            // Memilih DO dan scroll otomatis ke container progres pengiriman.
            pilihDO: function (x) {
                this.selectedDO = x;

            // Menunggu Vue selesai menampilkan container progres.
                this.$nextTick(function () {
                    var container = document.getElementById("progres-container");

                    if (container) {
                        container.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                        });
                    }
                });
            },

            // Membuat Delivery Order baru setelah validasi.
            tambahDO: function () {
                this.errors = [];

                // Memeriksa kelengkapan data formulir.
                if (
                    !this.form.nim ||
                    !this.form.nama ||
                    !this.form.ekspedisi ||
                    !this.paketDipilih ||
                    !this.form.tanggalKirim
                ) {
                    this.errors = [
                        "Lengkapi semua data Delivery Order.",
                    ];

                    SITTAAlert.fire({
                        icon: "warning",
                        title: "Data belum lengkap",
                        text: this.errors[0],
                    });

                    return;
                }

                var p = this.paketDipilih;

                // Menyusun data Delivery Order baru.
                var item = {
                    nomorDO: this.nomorDOBaru,
                    nim: this.form.nim.trim(),
                    nama: this.form.nama.trim(),
                    ekspedisi: this.form.ekspedisi,
                    kodePaket: p.kode,
                    namaPaket: p.nama,
                    tanggalKirim: this.form.tanggalKirim,
                    total: p.harga,
                    status: "Diproses",
                    perjalanan: [],
                };

                // Menambahkan DO ke dalam daftar.
                this.daftarDO.push(item);

                // Langsung memilih DO yang baru dibuat.
                this.selectedDO = item;

                // Menampilkan notifikasi keberhasilan.
                SITTAAlert.fire({
                    icon: "success",
                    title: "DO berhasil dibuat",
                    text: item.nomorDO,
                });

                // Mengosongkan formulir setelah berhasil.
                this.bersihkanForm();
            },

            // Mengembalikan formulir ke kondisi awal.
            bersihkanForm: function () {
                this.form = {
                    nim: "",
                    nama: "",
                    ekspedisi: "",
                    kodePaket: "",
                    tanggalKirim: this.tanggalHariIni(),
                };

                this.errors = [];
            },

            // Menambahkan catatan perjalanan dan memperbarui status DO.
            tambahProgress: function () {
                // Memastikan DO sudah dipilih dan keterangan terisi.
                if (
                    !this.selectedDO ||
                    !this.formProgress.keterangan.trim()
                ) {
                    return;
                }

                var now = new Date();
                var waktu = now.toLocaleString("sv-SE");

                // Menambahkan catatan ke riwayat perjalanan DO.
                this.selectedDO.perjalanan.push({
                    waktu: waktu,
                    keterangan: this.formProgress.keterangan.trim(),
                });

                // Menggunakan keterangan terbaru sebagai status DO.
                this.selectedDO.status =
                    this.formProgress.keterangan.trim();

                // Mengosongkan formulir progres.
                this.formProgress.keterangan = "";

                // Menampilkan notifikasi keberhasilan.
                SITTAAlert.fire({
                    icon: "success",
                    title: "Progres ditambahkan",
                });
            },
        },
    });
};