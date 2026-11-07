// =========================================
// KOMPONEN STATUS BADGE
// Menampilkan kondisi stok bahan ajar
// berdasarkan jumlah stok dan safety stock.
// =========================================

window.registerStatusBadge = function (tpl) {
    Vue.component("status-badge", {
        // Data yang diterima dari komponen pemanggil.
        props: ["item", "catatan"],

        // Menggunakan template HTML dari folder templates.
        template: tpl["status-badge.html"],

        // =====================================
        // COMPUTED PROPERTIES
        // Menentukan status, class CSS, dan simbol
        // berdasarkan kondisi stok bahan ajar.
        // =====================================

        computed: {
            // Menentukan keterangan kondisi stok.
            status: function () {
                if (this.item.qty === 0) {
                    return "Kosong";
                }

                if (this.item.qty < this.item.safety) {
                    return "Menipis";
                }

                return "Aman";
            },

            // Menentukan class CSS sesuai kondisi stok.
            statusClass: function () {
                if (this.item.qty === 0) {
                    return "status-empty";
                }

                if (this.item.qty < this.item.safety) {
                    return "status-low";
                }

                return "status-safe";
            },
        },
    });
};