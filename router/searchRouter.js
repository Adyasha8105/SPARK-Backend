const router = require('express').Router({ mergeParams:true });
const { searchDoctor } = require('../controllers/searchController')

router.get('/doctor',searchDoctor);

module.exports = router;