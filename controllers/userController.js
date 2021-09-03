
const bcrypt = require('bcrypt');
const client = require('../config');

module.exports = {
    async getAllPatients(req,res) {
        try{
            const { phoneno } = req.query;
            
            if(!phoneno)
            {
                console.log("1")
                const getAllPatients = 'Select * From patients';
                const result = await client.execute(getAllPatients,{prepare:true});
                // const response = await result.rows;
                res.send(result.rows.map(({password,...data}) => {
                    return {
                        ...data
                    }
                }));
            }
            else
            {
                console.log("2")
                const getPatient = 'Select * From patients Where phoneno=?';
                const result = await client.execute(getPatient,[phoneno],{prepare:true}).then(response => response.rows);
                // const response = await result.rows;
                
                
                if(result.length==0)
                res.send({
                    success:false,
                    status:500,
                    err:"No user found with this credential",
                    response:null
                })
                else {
                    const {password,...data} = result[0];
                    res.send({
                        success:true,
                        status:200,
                        err:null,
                        response:{
                            ...data,
                            type:"patient"
                        }
                    })

                }
                
            }

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
    async createPatient (req,res) {
        try {
            // console.log(req.body)
            const {
            id,
            name,
            age,
            city,
            state,
            address,
            pincode,
            dob,
            phoneNo,
            gender,
            bloodGp,
            email
            } = req.body;
            const addPatients = 'Insert Into patients(id,name,age,city,pincode,dob,state,address,phoneno,gender,bloodgp,email,createdat) Values(?,?,?,?,?,?,?,?,?,?,?,?,toTimestamp(now())) If Not Exists;';
            await client.execute(addPatients,[id,name,age,city,pincode,dob,state,address,phoneNo,gender,bloodGp,email],{prepare:true});
    
            const updateAuthPatient = 'Update authpatients Set isregistered=true Where phoneno=?';
            await client.execute(updateAuthPatient,[phoneNo],{prepare:true})
    
            const fetchPatient = 'Select * From patients Where phoneno=?'
            const { createdat,...data} = await client.execute(fetchPatient,[phoneNo],{prepare:true}).then(response => response.rows[0]);
            return res.send({
                success:true,
                status:200,
                err:null,
                response:{...data,type:"patient"}
            });
        }
        catch(err) {
            res.status(500).send({msg:err.message})
        }
        
    },

    async updatePatient(req,res) {
        
        try {
            const {
                name,
                age,
                city,
                state,
                address,
                phoneNo,
                email,
                password,
                dob,
                pincode,
                bloodGp,
                gender,
                } = req.body;
    
            const fetchPatient = 'Select password From authpatients Where phoneno=?';
            const response = await client.execute(fetchPatient,[phoneNo],{prepare:true}).then(response => response.rows[0]);
            
            // const isUser =await bcrypt.compare(password,response.password);
            // if(!isUser) {
            //     return res.send({
            //         success:false,
            //         status:500,
            //         err:"Password doesn't match",
            //         response:null
            //     })
            // }
            // else
            // console.log("Matching")
            const updatePatient = 'Update patients Set name=?,age=?,city=?,state=?,address=?,email=?,dob=?,pincode=?,bloodgp=?,gender=? Where phoneno=?';
            const result = await client.execute(updatePatient,[name,age,city,state,address,email,dob,pincode,bloodGp,gender,phoneNo],{prepare:true});
            const fetchUpdatedPatient = 'Select * From patients Where phoneno=?';
            const updatedResult =await client.execute(fetchUpdatedPatient,[phoneNo],{prepare:true}).then(response =>response.rows[0]);
    
            return res.send({
                success:true,
                status:200,
                err:null,
                response:updatedResult
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
    async deletePatient(req,res) {
        try{
            const {
                phoneNo,
                password
            } = req.body;
            console.log(req.body)
            const fetchPatient = 'Select password From authpatients Where phoneno=?';
            const response = await client.execute(fetchPatient,[phoneNo],{prepare:true}).then(response => response.rows[0]);
            
            const isUser = await bcrypt.compare(password,response.password)
            if(!isUser)
            {
                return res.send({
                    success:false,
                    status:500,
                    err:"Password doesn't match",
                    response:null
                })
            }
            
            const deletePatient = 'Delete From patients Where phoneno=?';
            const result1 = await client.execute(deletePatient,[phoneNo],{prepare:true});
    
            const deleteAuthPatient = 'Delete From authpatients Where phoneno=?';
            const result2 = await client.execute(deleteAuthPatient,[phoneNo],{prepare:true});
    
            return res.send({
                success:true,
                status:200,
                err:null,
                response:"Patient Deleted"
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

    async getAllDoctors(req,res) {
        try{
            const { phoneno } = req.query;
            
            if(!phoneno)
            {
                console.log("1")
                const getAllPatients = 'Select * From doctors';
                const result = await client.execute(getAllPatients,{prepare:true});
                // const response = await result.rows;
                const doctors = result.rows.map(({password,...data}) => {
                    return {
                        ...data
                    }
                });
                res.send({
                    success:true,
                    status:200,
                    err:null,
                    response:doctors
                })
            }
            else
            {
                console.log("2")
                const getPatient = 'Select * From doctors Where phoneno=?';
                const result = await client.execute(getPatient,[phoneno],{prepare:true}).then(response => response.rows);
                // const response = await result.rows;
                
                
                if(result.length==0)
                res.send({
                    success:false,
                    status:500,
                    err:"No doctor found with this credential",
                    response:null
                })
                else {
                    const {password,...data} = result[0];
                    res.send({
                        success:true,
                        status:200,
                        err:null,
                        response:{
                            ...data,
                            type:"doctor"
                        }
                    })

                }
                
            }

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
    async createDoctor (req,res) {
        try {
            // console.log(req.body)
            const {
            id,
            name,
            age,
            hospitalName,
            qualifications,
            specialisations,
            department,
            address,
            phoneNo,
            email,
            workingHrs,
            workingDays
            } = req.body;
            const addDoctor = 'Insert Into doctors(id,name,small_name,age,hospitalname,small_hospitalname,qualifications,specialisations,department,address,phoneno,email,workinghrs,workingDays,createdat) Values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,toTimestamp(now())) If Not Exists;';
            await client.execute(addDoctor,[id,name,name.toLowerCase(),age,hospitalName,hospitalName.toLowerCase(),qualifications,specialisations,department,address,phoneNo,email,workingHrs,workingDays],{prepare:true});
    
            const updateAuthDoctor = 'Update authdoctors Set isregistered=true Where phoneno=?';
            await client.execute(updateAuthDoctor,[phoneNo],{prepare:true})
    
            const fetchDoctor = 'Select * From doctors Where phoneno=?'
            const { createdat,...data} = await client.execute(fetchDoctor,[phoneNo],{prepare:true}).then(response => response.rows[0]);
            return res.send({
                success:true,
                status:200,
                err:null,
                response:{...data,type:"doctor"}
            });
        }
        catch(err) {
            res.status(500).send({msg:err.message})
        }
        
    },

    async updateDoctor(req,res) {
        
        try {
            const {
                name,
                age,
                hospitalName,
                qualifications,
                specialisations,
                department,
                address,
                phoneNo,
                email,
                workingHrs,
                workingDays,
                // password
                } = req.body;
         
    
            const fetchDoctor = 'Select password From authdoctors Where phoneno=?';
            const response = await client.execute(fetchDoctor,[phoneNo],{prepare:true}).then(response => response.rows[0]);
            
            // const isUser =await bcrypt.compare(password,response.password);
            // if(!isUser) {
            //     return res.send({
            //         success:false,
            //         status:500,
            //         err:"Password doesn't match",
            //         response:null
            //     })
            // }
            // else
            // console.log("Matching")
            const updateDoctor = 'Update doctors Set name=?,age=?,hospitalname=?,qualifications=?,specialisations=?,department=?,address=?,email=?,workinghrs=?,workingDays=? Where phoneno=?';
            const result = await client.execute(updateDoctor,[name,age,hospitalName,qualifications,specialisations,department,address,email,workingHrs,workingDays,phoneNo],{prepare:true});
            const fetchUpdatedDoctor = 'Select * From doctors Where phoneno=?';
            const updatedResult =await client.execute(fetchUpdatedDoctor,[phoneNo],{prepare:true}).then(response =>response.rows[0]);
    
            return res.send({
                success:true,
                status:200,
                err:null,
                response:updatedResult
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
    async deleteDoctor(req,res) {
        try{
            const {
                phoneNo,
                password
            } = req.body;
            console.log(req.body)
            const fetchDoctor = 'Select password From authdoctors Where phoneno=?';
            const response = await client.execute(fetchDoctor,[phoneNo],{prepare:true}).then(response => response.rows[0]);
            const isUser = await bcrypt.compare(password,response.password)
            if(!isUser)
            {
                return res.send({
                    success:false,
                    status:500,
                    err:"Password doesn't match",
                    response:null
                })
            }
            
            const deleteDoctor = 'Delete From doctors Where phoneno=?';
            const result1 = await client.execute(deleteDoctor,[phoneNo],{prepare:true});
    
            const deleteAuthDoctor = 'Delete From authdoctors Where phoneno=?';
            const result2 = await client.execute(deleteAuthDoctor,[phoneNo],{prepare:true});
    
            return res.send({
                success:true,
                status:200,
                err:null,
                response:"Doctor Deleted"
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