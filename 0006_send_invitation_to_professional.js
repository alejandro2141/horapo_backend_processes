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

html_template = await readHTMLFile(__dirname+"/0006_send_invitation_to_professional.html")
//  STEP 1 Get appointments require recover appointments taken
let emails = await getInvitationProfessionalToSend()
console.log (cdate.toLocaleString()+":S0006:INFO:SEND INVITATION TO PROFESSIONAL :"+JSON.stringify(emails) )


if (emails != null && emails.length > 0 )
{
    // WHILE  STEP 2 Get all appointments registered for each email
    for (let i = 0; i < emails.length ; i++) {
        
        let register = { 
                'email' : emails[i].email , 
                'message' : "<h1>noDataCancellation</h1>"
            }
        register.message = await buildHtmlMessage(html_template)
        email_invitation_list.push(register)       
      } //END FOR CYCLE 

     for (let i = 0; i < email_invitation_list.length ; i++)
      {
        console.log("email to be send to:"+JSON.stringify(email_invitation_list[i])+"  "  )
         await sendmail(email_invitation_list[i])
      }

}// end if eamil_list 
  


}

//************************************************** 
//*********    FUNCTIONS             *************** 
//************************************************** 
// GET DATA FORM DB
async function  getInvitationProfessionalToSend()
{
  const { Client } = require('pg')
  const client = new Client(conn_data)
  await client.connect()
 
      const sql_calendars  = "DELETE   FROM  invitation_professional    RETURNING * " ;  
  //  const sql_calendars  = "SELECT * FROM  appointment_cancelled   " ;  
  
  //console.log ("QUERY GET CALENDAR = "+sql_calendars);
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
       console.log(cdate.toLocaleString()+":S0006:INFO:EMAILS to send:"+data.email.toLowerCase() )

       
        transporter.sendMail(
          {            
            from: "Team_horapo"+Math.floor(Math.random()* (1000 - 1) + 1)+"@horapo.com",
            to: data.email.toLowerCase()  ,
            subject: 'horapo - Horas Profesionales',
            html: data.message ,
            
            ses: {
              // optional extra arguments for SendRawEmail
            },
          },
          (info) => {
            console.log(cdate.toLocaleString()+":S0006:INFO:"+info);
          }
        );
        
   

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


 let aux = await html.replace('[FRONT_HOST]',FRONT_HOST)
  return aux
}



