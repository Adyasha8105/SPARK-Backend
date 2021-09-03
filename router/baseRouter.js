const router = require('express').Router({mergeParams:true});
const userRouter = require('./userRouter');
const authRouter = require('./authRouter')
const searchRouter = require('./searchRouter')
const appointmentRouter = require('./appointmentRouter')

router.get('/',(req,res) => {
    res.send("Spark backend up and running");
})

router.use('/user',userRouter);

router.use('/auth',authRouter);

router.use('/search',searchRouter);

router.use('/appointment',appointmentRouter);

module.exports = router;
