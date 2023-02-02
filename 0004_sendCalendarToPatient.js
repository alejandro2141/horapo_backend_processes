//****************************************************  
//     SEND CALENDAR TO PATIENT  
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
let email_calendars_list = new Array() 
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

html_template = await readHTMLFile(__dirname+"/email_send_calendar_to_patient.html")
specialties = await getSpecialties()
locations = await getLocations()

//  STEP 1 Get emails require recover appointments taken
let email_list = await get_emailsToSendCalendarToPatient()
console.log (cdate.toLocaleString()+":S0004:INFO:EMAILS SEND Calendar to Patient:"+JSON.stringify(email_list) )
if (email_list != null && email_list.length > 0 )
{
    // WHILE  STEP 2 Get all appointments registered for each email
    for (let i = 0; i < email_list.length ; i++) {
        //let aux_req= email_list.pop()
        
        let register = { 
                'email' : email_list[i].email , 
                'message' : "<h1>noData</h1>"
            }
        let calendar = await getCalendarById(email_list[i].calendar_id) 
        
        console.log(" CALENDAR :"+JSON.stringify(calendar))  
            if (calendar != null  )
            {
              calendar = calendar[0]
                // SETP 3  : FORMAT LIST Appointments
                //GET CENTERS
               
                let center = await getCenter(calendar.center_id)
                console.log(" CENTER:"+JSON.stringify(center))
                //GET PROCESSIONAL
                let professional = await getProfessional(calendar.professional_id)
                console.log(" PROFESSIONAL:"+JSON.stringify(professional))
                let specialty = await specialties.find(spec => spec.id === calendar.specialty1 );
                console.log(" SPECIALTY:"+JSON.stringify(specialty))
                //  center_id_list.indexOf(apps.center_id) === -1 ? center_id_list.push(apps.center_id) : console.log("");
                //register.apps = html_data_email 
                
                let letLinkAgenda = FRONT_HOST+"/nested/publicSiteProfessional.html?params="+professional[0].id+"_"+calendar.id  
            
                //push to app list
                register.message = await buildHtmlMessage(html_template,calendar, center[0], professional[0],specialty ,letLinkAgenda )
                email_calendars_list.push(register) 
            }
            else 
            {
            let register = { 
                'email' : aux_email.email , 
                'message' : "<h1> [No Existen Citas Agendadas] </h1>"
                }
              email_calendars_list.push(register) 
            }
      
      } //END FOR CYCLE 

      //GET CENTERS by  center_id_list TO THEN SEARCH center name and address
      //console.log("EMAILS TO BE SENT:"+JSON.stringify(email_apps_list) )
      // STEP 3   Send emails suing list email_apps_list

     for (let i = 0; i < email_calendars_list.length ; i++)
      {
        console.log("email to be send to:"+JSON.stringify(email_calendars_list[i])+"  "  )
         await sendmail(email_calendars_list[i])
      }

}// end if eamil_list 
  



}

//************************************************** 
//*********    FUNCTIONS             *************** 
//************************************************** 
// GET DATA FORM DB
async function  get_emailsToSendCalendarToPatient()
{
  const { Client } = require('pg')
  const client = new Client(conn_data)
  await client.connect()
 
  //const sql_calendars  = "DELETE FROM send_calendar_patient RETURNING * " ;  
    const sql_calendars  = "SELECT * FROM  send_calendar_patient  " ;  
  
  //console.log ("QUERY GET CALENDAR = "+sql_calendars);
  const res = await client.query(sql_calendars) 
  client.end() 
  return res.rows ;
}

async function getCalendarById(cal_id){
 if (cal_id != null  )
 {
  const { Client } = require('pg')
  const client = new Client(conn_data)
  await client.connect()
  
  const sql_calendars  = "SELECT * FROM professional_calendar  WHERE id  = "+cal_id+" ";  
console.log("SQL : "+sql_calendars );
  //console.log ("QUERY GET CALENDAR = "+sql_calendars);
  const res = await client.query(sql_calendars) 
  client.end() 
  //console.log("Apps from :"+email)
  return res.rows ; 
 }
 else
 {
  return null
 }
}



async function getSpecialties(){
  const { Client } = require('pg')
  const client = new Client(conn_data)
  await client.connect()
 
  const sql_calendars  = "SELECT * FROM specialty " ;  

  //console.log ("QUERY GET CALENDAR = "+sql_calendars);
  const res = await client.query(sql_calendars) 
  client.end() 
  //console.log("Apps from :"+email)
  return res.rows ; 
}

async function getLocations(){
  const { Client } = require('pg')
  const client = new Client(conn_data)
  await client.connect()
  const sql_calendars  = "SELECT * FROM comuna " ;  
  const res = await client.query(sql_calendars) 
  client.end() 
  return res.rows ; 
}

async function getCenter(id){
  if (id !=null)
  {
  const { Client } = require('pg')
  const client = new Client(conn_data)
  await client.connect()
  
  const sql_center  = "SELECT * FROM center WHERE id = "+id+" " ;  
  
  console.log("CENTER SQL :"+sql_center);
  const res = await client.query(sql_center) 
  //console.log("CENTERS :"+JSON.stringify(res.rows) );
  client.end() 
  return res.rows ;
  }
  else 
  {
    return null 
  } 
  
}

async function getProfessional(id){
  const { Client } = require('pg')
  const client = new Client(conn_data)
  await client.connect()
  const sql_professional  = "SELECT * FROM professional WHERE id = "+id+" " ;  
  console.log(" sql professional :"+sql_professional)

  const res = await client.query(sql_professional) 
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
       console.log(cdate.toLocaleString()+":S0003:INFO:EMAILS to send:"+data.email.toLowerCase() )
        transporter.sendMail(
          {            
            from: "AGENDA-DIRECTA@123hora.com",
            to: data.email.toLowerCase()  ,
//            subject: "",
            subject: 'Le comparto mi agenda de horas disponibles',
            html: data.message ,
            
            ses: {
              // optional extra arguments for SendRawEmail
            },
          },
          (info) => {
            console.log(cdate.toLocaleString()+":S0003:INFO:"+info);
          }
        );
   

  }

async function readHTMLFile(path) {
  const html_data = await fs.readFileSync(path,{encoding:'utf8', flag:'r'});
  return html_data
}

async function buildHtmlMessage(html,calendar,center,professional,specialty, link ){
//console.log("CENTERS in BUILD HTML:"+JSON.stringify(centers))
  //1st build app list
  apps_html = new String()
 
  let specialty_name = specialty.name 
  let professional_name = professional.name
  let center_address = center.address
  let calendar_id = calendar.id 

  

  let aux = await html.replace('[SPECIALTY]',specialty_name).replace('[PROFESSIONAL]',professional_name).replace('[CENTER]',center_address).replace('[LINK_AGENDA]',link)

  return aux
}

/*
async function showSpecialtyName(id){
  let temp= await specialties.find(elem => elem.id ==  id  )
  if (temp != null) { return temp.name }
  else { return null }
}

async function getCenterData(id){
  let temp= await centers.find(elem => elem.id ==  id  )
  if (temp != null) { return temp }
  else { return null }
}

*/

async function comuna_id2name(id)
{
  let temp= await locations.find(elem => elem.id ==  id  )
  if (temp != null) { return temp.name }
  else { return null }
}


function transform_date(date)
{
//let temp = date.split("-") ;
let temp = new Date(date);
return ( temp.getDate()+" "+getMonthName(temp.getMonth()+1)+" "+temp.getFullYear() )
}

function transform_time(time)
{
let tim = new Date(time) ;
return (""+new String(tim.getHours()).padStart(2,0)+":"+new String(tim.getMinutes()).padStart(2,0) )
}

function getMonthName(month)
{
    //console.log("MONTH:"+parseInt(month));
    let months = ['nodata','Enero','Febrero' ,'Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre' ]
    return months[parseInt(month)];
}


