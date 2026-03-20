import multer from 'multer';

const storage = multer.diskStorage({
    filename: function(req,file,callback){
        callback(null,file.originalname)
    }
})


const upload = multer({storage})

export default upload





// backend/middlewares/multer.js

/*import multer from 'multer';

const storage = multer.memoryStorage(); // or diskStorage if you prefer
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (/image\/(jpeg|png|jpg|webp)/.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  }
});

export default upload;*/
