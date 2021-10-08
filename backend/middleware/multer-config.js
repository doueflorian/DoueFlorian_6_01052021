const multer = require('multer');

const storage = multer.diskStorage({

    // Définir l'espace de stockage dans le dossier images
    destination: function (req, file, cb) {
        cb(null, './images');
    },
    // Définier le nom depuis le nom d'originer + la date après "--"
    filename: function (req, file, cb) {
        cb(null,file.originalname + "--" + Date.now());
    }
});  

// Filtrer les extensions d'images, n'approuver que les Jpeg/JPG et PNG
const fileFilter = (req, file, cb) => {
    if((file.mimetype).includes('jpeg') || (file.mimetype).includes('png') || (file.mimetype).includes('jpg')){
        cb(null, true);
    } else{
        cb(null, false);
    }
};

module.exports = multer({ storage: storage, fileFilter: fileFilter,}).single('image');


