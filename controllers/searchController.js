const client = require('../config');

module.exports = {
    async searchDoctor(req,res) {
        try{
            
            const { 
                s,
                h
            } = req.query;

            if(!s && !h)
                return res.send({
                    success:true,
                    status:200,
                    err:null,
                    response:"Search fields are empty"
                });
    
            const searchQuery = s ? 'Select * From doctors Where small_name>=? Allow Filtering':'Select * From doctors Where small_hospitalname>=? Allow Filtering' ;
    
            const listOfDoctors = await client.execute(searchQuery,[s?s.toLowerCase():h.toLowerCase()],{prepare:true}).then(response => response.rows);
            
            
            

            const newList = listOfDoctors.filter(doc => s?
                doc.small_name.startsWith(s):
                doc.small_hospitalname.startsWith(h));
                
                if(newList.length==0)
                    return res.send({
                        success:true,
                        status:200,
                        err:null,
                        response:"No results found"
                    });
                return res.send({
                    success:true,
                    status:200,
                    err:null,
                    response:newList
                })
    
        }
        catch(err) {
            console.log(err);
            return res.send({
                success:false,
                status:400,
                err:err.message,
                response:null
            })
        }
        

    }
}