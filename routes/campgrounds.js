const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

// INDEX + CREATE  → /campgrounds
router.route('/')
  .get(catchAsync(campgrounds.index))
  .post(
    isLoggedIn,
    upload.array('images'),
    validateCampground,
    catchAsync(campgrounds.createCampground)
  );

// NEW → /campgrounds/new
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

// EDIT SAFETY → /campgrounds/edit
router.get('/edit', isLoggedIn, (req, res) => {
  req.flash('info', 'Please select a campground to edit');
  res.redirect('/campgrounds');
});

// EDIT FORM → /campgrounds/:id/edit
router.get('/:id/edit',
  isLoggedIn,
  isAuthor,
  catchAsync(campgrounds.renderEditForm)
);

// SHOW / UPDATE / DELETE → /campgrounds/:id
router.route('/:id')
  .get(catchAsync(campgrounds.showCampground))
  .put(
    isLoggedIn,
    isAuthor,
    upload.array('images'),
    validateCampground,
    catchAsync(campgrounds.updateCampground)
  )
  .delete(
    isLoggedIn,
    isAuthor,
    catchAsync(campgrounds.deleteCampground)
  );

module.exports = router;
