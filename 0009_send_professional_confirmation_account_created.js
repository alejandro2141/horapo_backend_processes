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
let email_list = new Array() 
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

  html_template = await readHTMLFile(__dirname+"/0009_send_professional_confirmation_account_created.html")
  //STEP 1 Get appointments require recover appointments taken
  let accounts = await getAccountCreationConfimationNotSent()
  
  if (accounts != null && accounts.length > 0  )
  {
  //MAP to leave just user_ids 
  let professional_id_list = accounts.map(val => val.user_id) 
  //GET all professional data  belong to user_ids
  let professionals = await getAllProfessionalsData(professional_id_list)
  let professionals_emails = professionals.map(val => val.email) 
  
  //console.log(cdate.toLocaleString()+"----------:S0009:INFO:SEND PROFESSIONAL ACCOUNT CREATED CONFIRMATION EMAILS LIST "+ professionals_emails +" " );

  if (professionals_emails != null && professionals_emails.length > 0 )
  {
   // console.log(cdate.toLocaleString()+":S0009:INFO:SEND PROFESSIONAL ACCOUNT CREATED CONFIRMATION  TO FOLLOWING EMAILS:["+ professionals_emails+"] " );

      // WHILE  STEP 2 Get all appointments registered for each email
      for (let i = 0; i < professionals_emails.length ; i++) {
      // console.log("create message to:"+professionals_emails[i]+"  "  )
          let register = { 
                  'email' : professionals_emails[i] , 
                  'message' : "<h1>NO SET</h1>"
              }
          register.message = await buildHtmlMessage(html_template, professionals_emails[i] )
          email_list.push(register)       
        } //END FOR CYCLE 

      for (let i = 0; i < email_list.length ; i++)
        {
          console.log("email to be send to:"+email_list[i]+"  "  )
          await sendmail(email_list[i])
          console.log(cdate.toLocaleString()+"----------:S0009:INFO: SEND PROFESSIONAL ACCOUNT CREATED CONFIRMATION  "+ email_list[i] +" " );
        }

  }// end if eamil_list 
  else
  { 
    console.log(cdate.toLocaleString()+":S0009:INFO: 0 EXIT" );
    process.exit()
  }




  }
else
  { 
    console.log(cdate.toLocaleString()+":S0009:INFO: 0 EXIT" );
    process.exit()
  }


} 
catch (e)
{
  console.log(cdate.toLocaleString()+":S0009:CATCH ERROR PROCESS EXIT:"+e);
  process.exit()
}


}

//************************************************** 
//*********    FUNCTIONS             *************** 
//************************************************** 
// GET DATA ACCOUNT CREATED BUT NOT CONFIRMED TO PROFESSIONAL YET
async function  getAccountCreationConfimationNotSent()
{
  const { Client } = require('pg')
  const client = new Client(conn_data)
  await client.connect() 
  const sql_calendars  = "UPDATE account SET confirmation_sent_creation = true  WHERE (confirmation_sent_creation = false  OR confirmation_sent_creation IS NULL ) RETURNING * ; " ;  
  const res = await client.query(sql_calendars) 
  client.end() 
  return res.rows ;
}

// GET PROFESSIONAL DATA 
async function  getAllProfessionalsData(professionals_id)
{
  const { Client } = require('pg')
  const client = new Client(conn_data)
  await client.connect() 
  const sql_calendars  = "SELECT * FROM professional WHERE  id IN ( "+professionals_id+" ) ; " ;  
  const res = await client.query(sql_calendars) 
  client.end() 
  return res.rows ;
}



// END GET DATA FORM DB

async function sendmail(data)
  {

    let nodemailer = require("nodemailer");
        let aws = require("@aws-sdk/client-ses");
        let { defaultProvider } = require("@aws-sdk/credential-provider-node");
        
        const ses = new aws.SES({
          apiVersion: "2010-12-01",
          region: "us-east-2",
          defaultProvider,
        });

        // create Nodemailer SES transporter
        let transporter = nodemailer.createTransport({
          SES: { ses, aws },
        });
        
       // console.log(" Sending Email data :"+JSON.stringify(data))

        
        // send some mail
       console.log(cdate.toLocaleString()+":S0009:INFO:EMAILS to send:"+data.email.toLowerCase() )

       
        transporter.sendMail(
          {            
            from: "contacto@horapo.com",
            to: data.email.toLowerCase()  ,
            subject: 'horapo - Horas Profesionales - Su cuenta ya esta lista para ser utilizada',
            html: data.message ,
            
            ses: {
              // optional extra arguments for SendRawEmail
            },
          },
          (info) => {
            console.log(cdate.toLocaleString()+":S0007:INFO:"+info);
          }
        );
        
   

  }

async function readHTMLFile(path) {
  const html_data = await fs.readFileSync(path,{encoding:'utf8', flag:'r'});
  return html_data
}

async function buildHtmlMessage(html,professional_email){
//console.log("CENTERS in BUILD HTML:"+JSON.stringify(centers))
  //1st build app list
/*
  apps_html = new String()
 
  let specialty_name = specialty.name 
  let professional_name = professional.name
  let center_address = center.address
  let calendar_id = calendar.id 

  [PROF_ACCOUNT]

  let aux = await html.replace('[SPECIALTY]',specialty_name).replace('[PROFESSIONAL]',professional_name).replace('[CENTER]',center_address).replace('[LINK_AGENDA]',link).replace('[DATE]',date).replace('[START_TIME]',start_time)
*/


 let aux = await html.replace(/\[FRONT_HOST\]/g,FRONT_HOST).replace('[PROF_ACCOUNT]',professional_email)
  return aux
}



