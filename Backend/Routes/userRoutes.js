const express = require('express');
const router = express.Router();
const { registerUser, registerProducer, registerArtist, loginUsers, updateUser, getUser, recoverPassword, resetUpdatePassword, getUserProducer, getUserArtist, getRole, updateUserProducer, updateUserArtist, search, addSongsToArtist, deleteSongArtist, updateSongsArtist, getAllArtist} = require('../Controllers/userController');
// const { protect } = require('../Middleware/authMiddleware');

router.post('/registerUser', registerUser);
router.post('/registerProducer', registerProducer);
router.post('/registerArtist', registerArtist);
router.post('/login', loginUsers);
router.patch('/updateUser/:mongoId', updateUser);
router.patch('/updateUserProducer/:id', updateUserProducer);
router.patch('/updateUserArtist/:email', updateUserArtist);
router.patch('/updatePassword', resetUpdatePassword);
router.patch('/recoverPassword', recoverPassword);
router.post('/rolUser', getRole);
router.post('/meUser', getUser);
router.post('/meUserProducer', getUserProducer);
router.post('/meUserArtist', getUserArtist);
router.get('/getAllArtist', getAllArtist);
router.post('/search', search);

router.post('/addSongs/:email', addSongsToArtist);
router.patch('/updateSong/:id/:songId', updateSongsArtist);
router.delete('/deleteSong/:email/:songId', deleteSongArtist);


module.exports = router