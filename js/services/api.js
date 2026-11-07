// =========================================
// SERVICE DATA DAN TEMPLATE
// Menyediakan fungsi untuk mengambil data JSON
// dan memuat template HTML ke dalam aplikasi.
// =========================================

window.SITTAApi = {

    // Mengambil data dari file JSON.
    getJSON: function (url) {
        return fetch(url).then(function (response) {

            // Memeriksa apakah permintaan berhasil.
            if (!response.ok) {
                throw new Error("Gagal membaca " + url);
            }

            // Mengubah respons menjadi objek JavaScript.
            return response.json();
        });
    },

    // Memuat beberapa template HTML secara bersamaan.
    loadTemplates: function (names) {
        return Promise.all(
            names.map(function (name) {

                // Mengambil file template berdasarkan nama.
                return fetch("templates/" + name)
                    .then(function (response) {

                        // Menangani template yang tidak ditemukan.
                        if (!response.ok) {
                            throw new Error(
                                "Template tidak ditemukan: " + name
                            );
                        }

                        return response.text();
                    })

                    // Mengembalikan pasangan nama file dan isi template.
                    .then(function (html) {
                        return [name, html];
                    });
            })
        ).then(function (pairs) {

            // Menyimpan seluruh template dalam satu objek.
            var result = {};

            pairs.forEach(function (pair) {
                result[pair[0]] = pair[1];
            });

            return result;
        });
    },
};