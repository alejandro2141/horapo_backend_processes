//****************************************************  
//     SEND INVITATION  
//****************************************************

/*
// SCRIPT REQUIRE set {home} .aws/credentials 
[default]
aws_access_key_id = 
aws_secret_access_key = 
*/

require(__dirname+'/config123_backend_process');

//let environment = "http://localhost:3000"
//let template ="./email_appointments_recover.html"
let html_template = new String() 
let specialties = new Array() 
let locations = new Array() 
let today = new Date()
today.setHours(0,0,0,0)

const { Pool, Client } = require('pg')
let email_invitation_list = new Array() 
var fs = require('fs');
//global variables 
let cdate=new Date()
let conn_data = {
  user: 'conmeddb_user',
  host: '127.0.0.1',
  database: 'conmeddb02',
  password: 'paranoid',
  port: 5432,
    }
//************************

let response = main();


//************************************************** 
//*********    MAIN()  ASYNC           *************** 
//************************************************** 
async function  main()
{
//Step 1, Get all EMails request Recover appointments taken
try { 

let newUsers = await getNewCustomersRegistration()
console.log (cdate.toLocaleString()+":S0008:INFO: START PROCESS CREATE ACCOUNT. Following users will be created: ")
newUsers.forEach((user) => console.log("User To be creted: "+user.email));

  if (newUsers != null && newUsers.length > 0 )
  {
    
      // WHILE  STEP 2 create account for every register
      for (let i = 0; i < newUsers.length ; i++) {
         
        // 1st create profesional register
        let professional = await createProfesional(newUsers[i])
        // 2nd create profesional account 
        let account = await createAccount(professional, newUsers[i].passwd)
        let account_specialty = await createSpecialtyRegister(account,newUsers[i].specialty)      
        
        } //END FOR CYCLE 

  }// end if eamil_list 
  else 
  {
    console.log (cdate.toLocaleString()+":S0008:INFO: No new User REGISTRATION ")
  }
} 
catch (e)
{
  console.log(cdate.toLocaleString()+":S0008:CATCH ERROR PROCESS EXIT:"+e );
  process.exit()
}


}

//************************************************** 
//*********    FUNCTIONS             *************** 
//************************************************** 
// GET DATA FORM DB
async function  getNewCustomersRegistration()
{
  const { Client } = require('pg')
  const client = new Client(conn_data)
  await client.connect()
      // const sql_calendars  = "UPDATE professional_register  SET confirmation_sent = true WHERE confirmation_sent IS NULL OR  confirmation_sent=false  RETURNING *   ;   " ;   
  const sql_registers = 'UPDATE professional_register   SET  user_created = NULL  WHERE user_created IS NULL OR FALSE  returning * '
     //  const sql_calendars  = "SELECT * FROM  appointment_cancelled   " ;  
  
  //console.log ("QUERY GET CALENDAR = "+sql_calendars);
  const res = await client.query(sql_registers) 
  client.end() 
  return res.rows ;
}


// END GET DATA FORM DB
async function createProfesional(user)
  {
    const { Client } = require('pg')
    const client = new Client(conn_data)
    await client.connect()
       // const sql_calendars  = "UPDATE professional_register  SET confirmation_sent = true WHERE confirmation_sent IS NULL OR  confirmation_sent=false  RETURNING *   ;   " ;  
    
      const sql_inserAccount = "INSERT INTO professional (name, document_number, license_number,  email, address, phone , active) VALUES ('"+user.name+"', '"+user.doc_id+"'  ,'No Set', '"+user.email+"' , '"+user.personal_address+"', '"+user.personal_phone+"', false   )  RETURNING * "

       //  const sql_calendars  = "SELECT * FROM  appointment_cancelled   " ;  
    
    //console.log ("QUERY GET CALENDAR = "+sql_calendars);
    const res = await client.query(sql_inserAccount) 
    console.log(cdate.toLocaleString()+":S0008:INFO: PROFESIONAL REGISTER Created for:"+user.email+"  ID Professional: "+res.rows[0].id );
    client.end() 
    return res.rows[0] ;

  }

// END GET DATA FORM DB
async function createAccount(professional,pass)
{
  const { Client } = require('pg')
  const client = new Client(conn_data)
  await client.connect()
     // const sql_calendars  = "UPDATE professional_register  SET confirmation_sent = true WHERE confirmation_sent IS NULL OR  confirmation_sent=false  RETURNING *   ;   " ;  
  
    const sql_inserAccount = "INSERT INTO account  (user_id, pass , active ) VALUES ( '"+professional.id+"' , '"+pass+"' , true )   RETURNING * "

     //  const sql_calendars  = "SELECT * FROM  appointment_cancelled   " ;  
  
  //console.log ("QUERY GET CALENDAR = "+sql_calendars);
  const res = await client.query(sql_inserAccount) 
  console.log(cdate.toLocaleString()+":S0008:INFO: ACCOUNT Created for:"+professional.email+" Account ID: "+res.rows[0].id+"  Professional ID: "+res.rows[0].user_id );
  client.end() 
  return res.rows[0] ;
}

//create specialty register

// END GET DATA FORM DB
async function  createSpecialtyRegister(account,id_specialty)
{
  const { Client } = require('pg')
  const client = new Client(conn_data)
  await client.connect()

 // console.log(cdate.toLocaleString()+":S0008:INFO: SPECIALTY Create process for:"+account.user_id+"  specialty :"+id_specialty );
     // const sql_calendars  = "UPDATE professional_register  SET confirmation_sent = true WHERE confirmation_sent IS NULL OR  confirmation_sent=false  RETURNING *   ;   " ;  
/*          let specialties = [
          {id: 100  , sname : "Kinesiología" },
          {id: 200	, sname : "Psicología" },
          {id: 300	, sname : "Fono audiología"},
          {id: 400	, sname : "Nutrición"},
          {id: 500	, sname : "Terapia Ocupacional"},
          {id: 600	, sname : "Psico pedagogia"},
          {id: 700	, sname : "Enfermería"},
          {id: 800	, sname : "Masoterapia"},
          ]  
          let specialty = await specialties.find(elem => elem.name ==  specialty_text  )
*/

      //let result =   specialties.find( (specialty) => specialty.sname === specialty_text );
     const sql_insertAccount = "INSERT INTO professional_specialty ( professional_id , specialty_id ) VALUES ( "+account.user_id+" , "+id_specialty+" ) RETURNING *   "
    //  const sql_calendars  = "SELECT * FROM  appointment_cancelled   " ;  
  
  //console.log ("QUERY GET CALENDAR = "+sql_calendars);
  const res = await client.query(sql_insertAccount) 
  console.log(cdate.toLocaleString()+":S0008:INFO: SPECIALTY created for Professional ID:"+account.user_id+" Specialty ID: "+id_specialty ) ;
  client.end() 
  return res.rows[0] ;
}