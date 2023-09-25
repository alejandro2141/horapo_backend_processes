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
console.log (cdate.toLocaleString()+":S0008:INFO: CREATE ACCOUNT OF CUSTOMER JUST REGISTERED")

  if (newUsers != null && newUsers.length > 0 )
  {
    
      // WHILE  STEP 2 create account for every register
      for (let i = 0; i < newUsers.length ; i++) {
         let usersAccount = await createNewUser(newUsers[i])
         console.log (cdate.toLocaleString()+":S0008:INFO: CREATE ACCOUNT OF CUSTOMER "+newUsers[i].email+" AccuntID:"+usersAccount.id )

        
        } //END FOR CYCLE 

  }// end if eamil_list 
  else 
  {
    console.log (cdate.toLocaleString()+":S0008:INFO: No new User REGISTRATION ")
  }
} 
catch (e)
{
  console.log(cdate.toLocaleString()+":S0008:CATCH ERROR PROCESS EXIT:"+e);
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
  const sql_registers = 'UPDATE professional_register   SET  user_created = TRUE  WHERE user_created IS NULL OR false  returning * '
     //  const sql_calendars  = "SELECT * FROM  appointment_cancelled   " ;  
  
  //console.log ("QUERY GET CALENDAR = "+sql_calendars);
  const res = await client.query(sql_registers) 
  client.end() 
  return res.rows ;
}


// END GET DATA FORM DB
async function createNewUser(user)
  {
    const { Client } = require('pg')
    const client = new Client(conn_data)
    await client.connect()
       // const sql_calendars  = "UPDATE professional_register  SET confirmation_sent = true WHERE confirmation_sent IS NULL OR  confirmation_sent=false  RETURNING *   ;   " ;  
    
      const sql_inserAccount = "INSERT INTO professional (name, document_number, license_number,  email, address, phone , active) VALUES ('"+user.name+"', '"+user.doc_id+"'  ,'No Set', '"+user.email+"' , '"+user.personal_address+"', '"+user.personal_phone+"', false   )  RETURNING * "

       //  const sql_calendars  = "SELECT * FROM  appointment_cancelled   " ;  
    
    //console.log ("QUERY GET CALENDAR = "+sql_calendars);
    const res = await client.query(sql_inserAccount) 
    console.log(cdate.toLocaleString()+":S0008:INFO: INSERT User "+user.name+"  "+JSON.stringify(res));
    client.end() 
    return res.rows[0] ;

  }


async function readHTMLFile(path) {
  const html_data = await fs.readFileSync(path,{encoding:'utf8', flag:'r'});
  return html_data
}

async function buildHtmlMessage(html){
//console.log("CENTERS in BUILD HTML:"+JSON.stringify(centers))
  //1st build app list
/*
  apps_html = new String()
 
  let specialty_name = specialty.name 
  let professional_name = professional.name
  let center_address = center.address
  let calendar_id = calendar.id 

  

  let aux = await html.replace('[SPECIALTY]',specialty_name).replace('[PROFESSIONAL]',professional_name).replace('[CENTER]',center_address).replace('[LINK_AGENDA]',link).replace('[DATE]',date).replace('[START_TIME]',start_time)
*/


 let aux = await html.replace(/\[FRONT_HOST\]/g,FRONT_HOST)
  return aux
}



