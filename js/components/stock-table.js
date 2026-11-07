// =========================================
// KOMPONEN TABEL STOK BAHAN AJAR
// Mengelola data, pencarian, filter, pengurutan,
// penambahan, pengeditan, dan penghapusan stok.
// =========================================

window.registerStockTable = function (tpl) {
    Vue.component("ba-stock-table", {
        // Data awal diterima dari komponen utama.
        props: ["initialData"],

        // Menggunakan template HTML dari folder templates.
        template: tpl["stock-table.html"],

        // =====================================
        // DATA KOMPONEN
        // Menyimpan data dan kondisi tampilan.
        // =====================================

        data: function () {
            return {
                // Menyalin data stok agar perubahan tidak langsung
                // mengubah array awal yang diterima melalui props.
                daftarBahanAjar: this.initialData.stok.map(function (x) {
                    return Object.assign({}, x);
                }),

                // Data pilihan untuk filter dan formulir.
                upbjjList: this.initialData.upbjjList,
                kategoriList: this.initialData.kategoriList,

                // Pengaturan filter dan pencarian.
                filterUPBJJ: "",
                filterKategori: "",
                filterStok: "semua",
                kataKunci: "",
                urutkan: "judul-asc",

                // Data formulir tambah dan edit bahan ajar.
                form: {
                    kode: "",
                    judul: "",
                    kategori: "",
                    upbjj: "",
                    lokasiRak: "",
                    qty: 0,
                    safety: 0,
                    harga: 0,
                    catatanHTML: "",
                },

                // Menyimpan data yang sedang diedit.
                formEdit: null,

                // Informasi pesan dan validasi formulir.
                pesan: "",
                jenisPesan: "info",
                errors: [],
            };
        },

        // =====================================
        // COMPUTED PROPERTIES
        // Mengolah data secara otomatis ketika
        // nilai yang menjadi dependensinya berubah.
        // =====================================

        computed: {
            // Menampilkan kategori berdasarkan UT-Daerah
            // yang sedang dipilih.
            kategoriTersedia: function () {
                if (!this.filterUPBJJ) {
                    return this.kategoriList;
                }

                var tersedia = this.daftarBahanAjar
                    .filter((x) => x.upbjj === this.filterUPBJJ)
                    .map((x) => x.kategori);

                return this.kategoriList.filter(
                    (k) => tersedia.indexOf(k) !== -1
                );
            },

            // Memfilter dan mengurutkan daftar bahan ajar.
            bahanAjarTerfilter: function () {
                var hasil = this.daftarBahanAjar.filter(function (item) {
                    var kata = this.kataKunci.toLowerCase();

                    // Memeriksa kecocokan kata kunci.
                    var cocokKata =
                        !kata ||
                        (item.kode + " " + item.judul + " " + item.lokasiRak)
                            .toLowerCase()
                            .includes(kata);

                    // Memeriksa kondisi stok.
                    var cocokStok =
                        this.filterStok === "semua" ||
                        (this.filterStok === "menipis" &&
                            item.qty > 0 &&
                            item.qty < item.safety) ||
                        (this.filterStok === "kosong" && item.qty === 0) ||
                        (this.filterStok === "reorder" &&
                            item.qty < item.safety);

                    // Memeriksa seluruh kondisi filter.
                    return (
                        (!this.filterUPBJJ ||
                            item.upbjj === this.filterUPBJJ) &&
                        (!this.filterKategori ||
                            item.kategori === this.filterKategori) &&
                        cocokKata &&
                        cocokStok
                    );
                }, this);

                // Mengurutkan hasil filter sesuai pilihan pengguna.
                var sort = this.urutkan;

                return hasil.slice().sort(function (a, b) {
                    if (sort === "judul-asc") {
                        return a.judul.localeCompare(b.judul);
                    }

                    if (sort === "stok-asc") {
                        return a.qty - b.qty;
                    }

                    if (sort === "stok-desc") {
                        return b.qty - a.qty;
                    }

                    if (sort === "harga-asc") {
                        return a.harga - b.harga;
                    }

                    if (sort === "harga-desc") {
                        return b.harga - a.harga;
                    }

                    return 0;
                });
            },

            // Menghitung jumlah bahan ajar dengan stok kosong.
            jumlahKosong: function () {
                return this.daftarBahanAjar.filter(
                    (x) => x.qty === 0
                ).length;
            },

            // Menghitung jumlah bahan ajar dengan stok menipis.
            jumlahMenipis: function () {
                return this.daftarBahanAjar.filter(
                    (x) => x.qty > 0 && x.qty < x.safety
                ).length;
            },
        },

        // =====================================
        // WATCHERS
        // Memantau perubahan nilai tertentu
        // dan menjalankan tindakan otomatis.
        // =====================================

        watch: {
            // Mengatur ulang kategori jika tidak sesuai
            // dengan UT-Daerah yang dipilih.
            filterUPBJJ: function () {
                if (
                    this.filterKategori &&
                    this.kategoriTersedia.indexOf(this.filterKategori) === -1
                ) {
                    this.filterKategori = "";
                }
            },

            // Menampilkan informasi ketika filter reorder dipilih.
            filterStok: function (v) {
                this.pesan =
                    v === "reorder"
                        ? "Menampilkan bahan ajar yang perlu diperiksa untuk pemesanan ulang."
                        : "";
            },

            // Menampilkan informasi ketika kata kunci berubah.
            kataKunci: function (v) {
                if (v) {
                    this.pesan = "Daftar diperbarui sesuai kata kunci.";
                }
            },
        },

        // =====================================
        // METHODS
        // Fungsi untuk mengelola data bahan ajar.
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

            // Menghilangkan tag HTML dari catatan.
            teksCatatan: function (html) {
                return String(html || "").replace(/<[^>]*>/g, "");
            },

            // Mengembalikan seluruh filter ke kondisi awal.
            resetFilter: function () {
                this.filterUPBJJ = "";
                this.filterKategori = "";
                this.filterStok = "semua";
                this.kataKunci = "";
                this.urutkan = "judul-asc";
                this.pesan = "Filter berhasil direset.";
            },

            // Memeriksa kelengkapan dan validitas data formulir.
            validasiForm: function () {
                var e = [];

                // Memeriksa kolom yang wajib diisi.
                ["kode", "judul", "lokasiRak"].forEach((k) => {
                    if (!String(this.form[k]).trim()) {
                        e.push(k + " wajib diisi.");
                    }
                });

                // Memeriksa pilihan kategori dan UT-Daerah.
                if (!this.form.kategori) {
                    e.push("Kategori wajib dipilih.");
                }

                if (!this.form.upbjj) {
                    e.push("UT-Daerah wajib dipilih.");
                }

                // Memeriksa nilai jumlah stok, safety stock, dan harga.
                ["qty", "safety", "harga"].forEach((k) => {
                    var n = Number(this.form[k]);

                    if (
                        this.form[k] === "" ||
                        !Number.isFinite(n) ||
                        n < 0 ||
                        ((k === "qty" || k === "safety") &&
                            !Number.isInteger(n))
                    ) {
                        e.push(
                            k + " harus berupa angka valid dan tidak negatif."
                        );
                    }
                });

                // Memeriksa agar kode bahan ajar tidak duplikat.
                if (
                    this.daftarBahanAjar.some(
                        (x) =>
                            x.kode.toLowerCase() ===
                                this.form.kode.trim().toLowerCase() &&
                            (!this.formEdit ||
                                x.kode !== this.formEdit.kode)
                    )
                ) {
                    e.push("Kode mata kuliah sudah digunakan.");
                }

                this.errors = e;

                return !e.length;
            },

            // Menambahkan data baru atau menyimpan perubahan data.
            tambahBahanAjar: function () {
                // Menghentikan proses jika validasi gagal.
                if (!this.validasiForm()) {
                    this.pesan = "Periksa kembali data yang belum valid.";
                    this.jenisPesan = "error";

                    SITTAAlert.fire({
                        icon: "error",
                        title: "Data belum valid",
                        html:
                            '<ul style="text-align:left">' +
                            this.errors
                                .map((x) => "<li>" + x + "</li>")
                                .join("") +
                            "</ul>",
                    });

                    return;
                }

                // Membentuk objek data bahan ajar dari formulir.
                var item = {
                    kode: this.form.kode.trim(),
                    judul: this.form.judul.trim(),
                    kategori: this.form.kategori,
                    upbjj: this.form.upbjj,
                    lokasiRak: this.form.lokasiRak.trim(),
                    qty: Number(this.form.qty),
                    safety: Number(this.form.safety),
                    harga: Number(this.form.harga),
                    catatanHTML: this.form.catatanHTML.trim(),
                };

                // Memeriksa apakah formulir sedang dalam mode edit.
                if (this.formEdit) {
                    var i = this.daftarBahanAjar.findIndex(
                        (x) => x.kode === this.formEdit.kode
                    );

                    if (i !== -1) {
                        this.$set(this.daftarBahanAjar, i, item);
                    }

                    this.pesan = "Data bahan ajar berhasil diperbarui.";

                    SITTAAlert.fire({
                        icon: "success",
                        title: "Data diperbarui",
                        text: this.pesan,
                    });
                } else {
                    // Menambahkan data baru ke dalam daftar.
                    this.daftarBahanAjar.push(item);
                    this.pesan = "Data bahan ajar berhasil ditambahkan.";

                    SITTAAlert.fire({
                        icon: "success",
                        title: "Data ditambahkan",
                        text: this.pesan,
                    });
                }

                this.jenisPesan = "info";

                // Mengosongkan formulir setelah proses selesai.
                this.bersihkanForm();
            },

            // Mengisi formulir menggunakan data yang dipilih.
            mulaiEdit: function (item) {
                this.formEdit = {
                    kode: item.kode,
                };

                this.form = Object.assign({}, item);
                this.errors = [];

                this.pesan =
                    "Mode edit: ubah data lalu tekan Simpan Perubahan.";

                // Mengarahkan tampilan ke bagian formulir.
                window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: "smooth",
                });
            },

            // Mengubah jumlah stok secara langsung melalui popup.
            ubahStokCepat: function (item) {
                var vm = this;

                SITTAAlert.fire({
                    title: "Ubah jumlah stok",
                    text: "Masukkan jumlah stok baru untuk " + item.kode,
                    input: "number",
                    inputValue: item.qty,
                    inputAttributes: {
                        min: 0,
                        step: 1,
                    },
                    showCancelButton: true,
                    confirmButtonText: "Simpan",
                    cancelButtonText: "Batal",

                    // Memastikan stok berupa bilangan bulat
                    // dan tidak memiliki nilai negatif.
                    inputValidator: function (v) {
                        if (
                            v === "" ||
                            !Number.isInteger(Number(v)) ||
                            Number(v) < 0
                        ) {
                            return "Stok harus bilangan bulat 0 atau lebih.";
                        }
                    },
                }).then(function (r) {
                    if (r.isConfirmed) {
                        item.qty = Number(r.value);
                        vm.pesan = "Jumlah stok berhasil diperbarui.";
                    }
                });
            },

            // Menghapus data bahan ajar setelah konfirmasi.
            hapusBahanAjar: function (item) {
                var vm = this;

                SITTAAlert.fire({
                    title: "Hapus bahan ajar?",
                    text: "Data " + item.kode + " akan dihapus.",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Ya, hapus",
                    cancelButtonText: "Batal",
                }).then(function (r) {
                    if (r.isConfirmed) {
                        vm.daftarBahanAjar = vm.daftarBahanAjar.filter(
                            (x) => x.kode !== item.kode
                        );

                        SITTAAlert.fire(
                            "Terhapus",
                            "Data bahan ajar berhasil dihapus.",
                            "success"
                        );
                    }
                });
            },

            // Mengembalikan formulir ke kondisi awal.
            bersihkanForm: function () {
                this.form = {
                    kode: "",
                    judul: "",
                    kategori: "",
                    upbjj: "",
                    lokasiRak: "",
                    qty: 0,
                    safety: 0,
                    harga: 0,
                    catatanHTML: "",
                };

                this.formEdit = null;
                this.errors = [];
            },
        },
    });
};