const router = require('express').Router({mergeParams:true});
const { getAllAppointments, createAppointment ,deleteAppointment,updateAppointment} = require('../controllers/appointmentController')

router.get('/all',getAllAppointments);

router.post('/create',createAppointment);

router.delete('/cancel',deleteAppointment);

router.put("/update",updateAppointment);

module.exports = router;