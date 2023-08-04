const express = require('express');
const router = express.Router();
const { registerUser, registerProducer, registerArtist, loginUsers, updateUser, getUser, recoverPassword, resetUpdatePassword, getUserProducer, getUserArtist, getRole, getAllParking, updateUserProducer, updateUserArtist, search, getBooking, getBookingById, getBookingByNitParking, createBooking, getUserSpaces, updateSpaceById, addSongsToArtist, deleteSongsArtist, updateSongsArtist, getAllArtist} = require('../Controllers/userController');
// const { protect } = require('../Middleware/authMiddleware');

router.post('/registerUser', registerUser);
router.post('/registerProducer', registerProducer);
router.post('/registerArtist', registerArtist);
router.post('/login', loginUsers);
router.patch('/updateUser/:mongoId', updateUser);
router.patch('/updateUserProducer/:id', updateUserProducer);
router.patch('/updateUserArtist/:id', updateUserArtist);
router.patch('/updatePassword', resetUpdatePassword);
router.patch('/recoverPassword', recoverPassword);
router.post('/rolUser', getRole);
router.post('/meUser', getUser);
router.post('/meUserProducer', getUserProducer);
router.post('/meUserArtist', getUserArtist);
router.get('/getAllArtist', getAllArtist);
router.post('/search', search);
// router.get('/getAllBookings', getBooking);
// router.get('/getBookingsById/:idUser', getBookingById)
// router.get('/getBookingsByNitParking/:nitParking', getBookingByNitParking)
// router.get('/getSpacesById/:idUserParking', getUserSpaces)
// router.patch('/updateSpaceById/:idUserParking/:_id', updateSpaceById)
// router.post('/createBooking', createBooking);
router.post('/addSongs/:id', addSongsToArtist);
router.patch('/updateSong/:id/:songsId', updateSongsArtist);
router.delete('/deleteSong/:id/:songsId', deleteSongsArtist);


module.exports = router