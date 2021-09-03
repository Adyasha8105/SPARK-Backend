const router = require('express').Router({ mergeParams:true });

const { createPatient, updatePatient, getAllPatients, deletePatient, getAllDoctors, createDoctor, updateDoctor, deleteDoctor } = require('../controllers/userController');

router.get('/patients',getAllPatients)

router.post('/patients',createPatient);

router.put('/patients',updatePatient);

router.delete('/patients',deletePatient);

router.get('/doctors',getAllDoctors)

router.post('/doctors',createDoctor);

router.put('/doctors',updateDoctor);

router.delete('/doctors',deleteDoctor);

module.exports = router;