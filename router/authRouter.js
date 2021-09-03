const router = require('express').Router({ mergeParams:true });
const authMiddleware = require('../middlewares/authMiddleware');
const { logoutPatient, loginPatient, signupPatient, signupDoctor, loginDoctor, logoutDoctor } = require('../controllers/authController');


router.post('/patient/signup',signupPatient)

router.post('/patient/login',loginPatient)

router.get('/patient/logout',authMiddleware,logoutPatient)

router.post('/doctor/signup',signupDoctor)

router.post('/doctor/login',loginDoctor)

router.get('/doctor/logout',authMiddleware,logoutDoctor)

module.exports = router;