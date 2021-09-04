const client = require("../config");
const addTime = require("../utils/time");

module.exports = {
    async getAllAppointments(req,res) {

        try {

            const { 
                pphoneNo,
                dphoneNo,
                status,
                forUser,
                fromToday
            } = req.query;
            
            if(forUser == 'patient') {
                var utc = new Date().toJSON().slice(0,10);
                if(!status) {
                    
                    const getAllPatient = 'Select * From appointmentpatient Where pphoneNo=? And apdate>=? Order By apdate Asc';
                    const result = await client.execute(getAllPatient,[pphoneNo,utc],{prepare:true}).then(response => response.rows);
                    if(result.length==0)
                        return res.send({
                            success:false,
                            status:500,
                            err:null,
                            response:"No appointments for this patient"
                        })
                    else
                        return res.send({
                            success:true,
                            status:200,
                            err:null,
                            response:result
                        })
                }
                else { 
                    const getSpecificPatient = 'Select * From appointmentpatient Where pphoneNo=? And status=? Order By apdate Asc Allow Filtering';
                    const result = await client.execute(getSpecificPatient,[pphoneNo,status.toLowerCase()],{prepare:true}).then(response => response.rows);
                    if(result.length==0)
                        return res.send({
                            success:false,
                            status:500,
                            err:null,
                            response:"No such appointments for this patient"
                        })
                    else
                        return res.send({
                            success:true,
                            status:200,
                            err:null,
                            response:result
                        })
                }
            }
            else {
                if(!dphoneNo)
                    return res.send({
                        success:false,
                        status:500,
                        err:"Please give the phone number for the doctor"
                    })
                var utc = new Date().toJSON().slice(0,10);
                if(status==null) {

                    console.log("1",status)
                    const getAllPatients = 'Select * From appointmentdoctor Where dphoneno=? And apdate>=? Allow Filtering' ;
                    const result = await client.execute(getAllPatients,[dphoneNo,utc],{prepare:true}).then(response => response.rows);

                    if(result.length==0) 
                            return res.send({
                                success:false,
                                status:500,
                                err:null,
                                response:"No appointments for this date"
                            })
                        else
                            return res.send({
                                success:true,
                                status:200,
                                err:null,
                                response:result
                            })
                    
                
                }
                else {
                    
                    const getCurrentPatientWithStatus = 'Select * From appointmentdoctor Where dphoneno=? And status=? And apdate>=? Allow Filtering' ;
                    const result = await client.execute(getCurrentPatientWithStatus,[dphoneNo,status,utc],{prepare:true}).then(response => response.rows);
                    if(result.length==0) 
                            return res.send({
                                success:false,
                                status:500,
                                err:null,
                                response:"No appointments for this date with this status"
                            })
                        else
                            return res.send({
                                success:true,
                                status:200,
                                err:null,
                                response:result
                            })
                }

            }
            
            

            

        }
        catch(err) {
            return res.send({
                success:false,
                status:404,
                err:err.message,
                response:null
            })
        }
    },
    async createAppointment(req,res) {

       try{

        const { 
            apdate ,
            pphoneno ,
            dphoneno ,
            symptoms ,
            type,
        } = req.body;

        // console.log(req.body)

        // const query = 'Select createdat From doctors Where phoneno=?';
        // const {createdat} = await client.execute(query,[dphoneno],{prepare:true}).then(response=>response.rows[0]);
        // const str=JSON.stringify(createdat);
        // console.log(typeof str)
        // res.send(str.substring(1,str.length-2))
        const todayDate = new Date().toJSON().slice(0,10);
        if(apdate<todayDate)
            return res.send({
                success:false,
                status:500,
                err:"Invalid Date,You cannot book an appointment in the past",
                response:null
            })
        
            
        var weekday = new Array(7);
        weekday[0] = "Sunday";
        weekday[1] = "Monday";
        weekday[2] = "Tuesday";
        weekday[3] = "Wednesday";
        weekday[4] = "Thursday";
        weekday[5] = "Friday";
        weekday[6] = "Saturday";
        const day=weekday[(new Date(apdate)).getDay()].toLowerCase();
   
        const doctorDetails = 'Select * From doctors Where phoneno=?';
        const doctorResult = await client.execute(doctorDetails,[dphoneno],{prepare:true}).then(response => response.rows[0]);
        // console.log("DOCTOR RESULT",doctorResult)
        if(doctorResult==undefined)
            return res.send({
                success:false,
                status:500,
                err:"No such doctor is available",
                response:null
            })

        
        

        // const checkDoctorAvailable = 'Select * From doctors Where phoneno=? And workingdays Contains ? Allow Filtering';
        // const resultAvailable = await client.execute(checkDoctorAvailable,[dphoneno,day.toLowerCase()],{prepare:true}).then(response => response.rows);
        // console.log(doctorResult)
        if(!(doctorResult.workingdays.includes(day)))
            return res.send({
                success:false,
                status:500,
                err:`Dr. ${doctorResult.name} is not available on this date`,
                response:{
                    message:`Dr. ${doctorResult.name} is not available on these days`,
                    Days:doctorResult.workingdays
                }
            })
        const isAppointmentExists = 'Select * From appointmentdoctor Where dphoneno=? and apdate=? And pphoneno=? Allow Filtering';
        const existResult = await client.execute(isAppointmentExists,[dphoneno,apdate,pphoneno],{prepare:true}).then(response => response.rows[0]);
        
        if(existResult)
        {
            return res.send({
                success:false,
                status:500,
                err:"You have already booked an appointment with this doctor on this date",
                response:null
            })
        }
        
        const fetchLatestAppointment = 'Select * From appointmentdoctor Where dphoneno=? and apdate=? Order By createdat Desc Limit 1 Allow Filtering';
        const fetchResult = await client.execute(fetchLatestAppointment,[dphoneno,apdate],{prepare:true}).then(response => response.rows);
        // return res.send(fetchResult)
        // console.log("Fetch",fetchResult)
        const createAppointmentQuery1 = 'Insert Into appointmentpatient(id,pphoneno,dphoneno,apdate,type,symptoms,serialno,aptime,status,createdat) Values(uuid(),?,?,?,?,?,?,?,?,toTimestamp(now()))';
        const createAppointmentQuery2 = 'Insert Into appointmentdoctor(id,pphoneno,dphoneno,apdate,type,symptoms,serialno,aptime,status,createdat) Values(uuid(),?,?,?,?,?,?,?,?,toTimestamp(now()))';
        const status='queued'


        // console.log(typeof doctorResult.workinghrs.start.toString());
        
        // return res.send(fetchResult)
        // console.log("FETCHED RESULT",fetchResult)
        if(fetchResult.length==0)
        {
            const queries = [
                { query: createAppointmentQuery1, params: [pphoneno,dphoneno,apdate,type,symptoms,1,{ "start":doctorResult.workinghrs.start.toString().slice(0,5) , "end" : addTime(doctorResult.workinghrs.start.toString().slice(0,5))},status]},
                { query: createAppointmentQuery2, params: [pphoneno,dphoneno,apdate,type,symptoms,1,{ "start":doctorResult.workinghrs.start.toString().slice(0,5) , "end" : addTime(doctorResult.workinghrs.start.toString().slice(0,5))},status]} 
            ];
            
            await client.batch(queries, { prepare: true });
            
        }
        else
        {
            
            const queries = [
                { query: createAppointmentQuery1, params: [pphoneno,dphoneno,apdate,type,symptoms,fetchResult[0].serialno+1,{ "start":fetchResult[0].aptime.end , "end" : addTime(fetchResult[0].aptime.end)},status]},
                { query: createAppointmentQuery2, params: [pphoneno,dphoneno,apdate,type,symptoms,fetchResult[0].serialno+1,{ "start":fetchResult[0].aptime.end , "end" : addTime(fetchResult[0].aptime.end)},status]} 
            ];
            
            await client.batch(queries, { prepare: true })
            
        }
        const getResult = 'Select * From appointmentpatient Where pphoneno=? And dphoneno=? And apdate=? Allow Filtering';
        const finalResult = await client.execute(getResult,[pphoneno,dphoneno,apdate],{prepare:true}).then(response => response.rows[0])
      

        const ts = JSON.stringify(finalResult.createdat);
        const createdAt=ts.substring(1,ts.length-2)
        return res.send({
            success:true,
            status:200,
            err:null,
            response:{
                pphoneno:pphoneno,
                dphoneno:dphoneno,
                apdate:apdate,
                createdat:createdAt,
                serialno:finalResult.serialno,
                id:finalResult.id,
                symptoms:finalResult.symptoms,
                status:finalResult.status,
                type:'appointment',
                aptime:finalResult.aptime
            }
        })
       }
       catch(err) {
           return res.send({
               success:false,
               status:500,
               err:err.message,
               response:null
           })
       }
 
    },
    async deleteAppointment(req,res) {
        
        try {
            const {
                pphoneno,
                dphoneno,
                aptdate,
                createdat
            } = req.body;

            const DeleteQuery1 = `Delete From appointmentpatient Where pphoneno=? And apdate=? And createdat='${createdat}'`;
            const DeleteQuery2 = `Delete From appointmentdoctor Where dphoneno=? And apdate=? And createdat='${createdat}'`;
            const queries = [
                {
                    query:DeleteQuery1,params:[pphoneno,aptdate]
                },
                {
                    query:DeleteQuery2,params:[dphoneno,aptdate]
                }
            ]
            const result = await client.batch(queries, {prepare:true});
            console.log(result)
            return res.send({
                success:true,
                status:200,
                err:null,
                response:"Successfully deleted"
            })

        }
        catch(err) {
            return res.send({
                success:false,
                status:500,
                err:err.message,
                response:null
            })
        }
    },

    async updateAppointment(req,res) {

        try{
            const {
                pphoneno,
                dphoneno,
                apdate,
                createdat,
                status
            } = req.body;
            console.log(req.body)
            const isAppointmentQuery = 'Select * From appointmentdoctor Where dphoneno=? And pphoneno=? And apdate=? Allow Filtering';
            const isAppointmentExists = await client.execute(isAppointmentQuery,[dphoneno,pphoneno,apdate],{prepare:true}).then(response=>response.rows);
            if(isAppointmentExists.length==0)
            {
                return res.send({
                    success:false,
                    status:500,
                    err:"No appointment exists for today's date",
                    response:null
                })
            }

            // const getWorkingHrsQuery = 'Select workinghrs from doctors where phoneno=?';
            // const getWorkingHrsEnd = await client.execute(getWorkingHrsQuery,[dphone],{prepare:true}).end;
        
            // const todayDate = new Date().toJSON().slice(0,10);
            // const todayTime = (new Date).toLocaleTimeString('en-US',{hour12:false})
            // if(apdate==todayDate && getWorkingHrsEnd<todayTime)
           
                const updateQuery1 = `Update appointmentpatient Set status=? Where pphoneno=? And apdate=? And createdat='${createdat}'`;
                const updateQuery2 = `Update appointmentdoctor Set status=? Where dphoneno=? And apdate=? And createdat='${createdat}'`;

                const queries=[
                    {
                        query:updateQuery1,params:[status,pphoneno,apdate]
                    },
                    {
                        query:updateQuery2,params:[status,dphoneno,apdate]
                    }
                ]
                const result = await client.batch(queries,{prepare:true});

                const getQuery = `Select * From appointmentpatient Where pphoneno=? And apdate=? And createdat='${createdat}'`;
                const getResult  = await client.execute(getQuery,[pphoneno,apdate],{prepare:true}).then(response => response.rows[0]);
      
            
               


            res.send({
                success:true,
                status:500,
                err:null,
                response:{
                    message:"Successfully updated status",
                    data:getResult
                }
            })

        }
        catch(err) {
            return res.send({
                success:false,
                status:500,
                err:err.message,
                response:null
            })
        }
    }
}