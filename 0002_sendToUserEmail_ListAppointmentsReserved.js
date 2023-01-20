

let path_html ="/home/alejandro/Documents/GitHub/backend_processes/email_appointments_recover.html"
let html_template = new String() 
let specialties = new Array() 
let locations = new Array() 

const { Pool, Client } = require('pg')
let email_apps_list = new Array() 
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
console.log("Step1");
html_template = await readHTMLFile(path_html)
specialties = await getSpecialties()
locations = await getLocations()


//  STEP 1 Get emails require recover appointments taken
let email_list = await get_emailsRequestRecoverAppointments()
//  STEP 2 Get all appointments registered for each email
while  (email_list.length > 0) {
  let aux_email= email_list.pop()
  
  let register = { 
        'email' : aux_email.email , 
        'message' : "<h1>noData</h1>"
      }
  let apps = await getAppointmentsByEmail(aux_email.email) 
  
  // SETP 3  : FORMAT LIST Appointments
  let center_id_list = apps.map(val => val.center_id) 
  //remove duplicated
  let aux_centers = await getCenters(center_id_list)
  //  center_id_list.indexOf(apps.center_id) === -1 ? center_id_list.push(apps.center_id) : console.log("");
 
  //register.apps = html_data_email 
 
  //push to app list
  register.message = await buildHtmlMessage(html_template,apps,aux_centers)
  email_apps_list.push(register) 
  }

  //GET CENTERS by  center_id_list TO THEN SEARCH center name and address
  console.log("EMAILS TO BE SENT:"+JSON.stringify(email_apps_list) )
  // STEP 3   Send emails suing list email_apps_list
  while (email_apps_list.length >0 ) 
  {
    let register = email_apps_list.pop()
    //await sendmail(register)
  }
  



}

//************************************************** 
//*********    FUNCTIONS             *************** 
//************************************************** 
// GET DATA FORM DB
async function  get_emailsRequestRecoverAppointments()
{
  const { Client } = require('pg')
  const client = new Client(conn_data)
  await client.connect()
 
  const sql_calendars  = "SELECT email FROM patient_recover_appointments" ;  

  //console.log ("QUERY GET CALENDAR = "+sql_calendars);
  const res = await client.query(sql_calendars) 
  client.end() 
  console.log("Return email request")
  return res.rows ;
}

async function getAppointmentsByEmail(email){
  const { Client } = require('pg')
  const client = new Client(conn_data)
  await client.connect()
 
  const sql_calendars  = "SELECT * FROM appointment WHERE upper(patient_email)= upper('"+email+"') " ;  

  //console.log ("QUERY GET CALENDAR = "+sql_calendars);
  const res = await client.query(sql_calendars) 
  client.end() 
  //console.log("Apps from :"+email)
  return res.rows ; 
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

async function getCenters(ids){
  const { Client } = require('pg')
  const client = new Client(conn_data)
  await client.connect()
  const sql_centers  = "SELECT * FROM center WHERE id IN ("+ids+") " ;  
  
  console.log("CENTERS IDS:"+sql_centers);
  const res = await client.query(sql_centers) 
  console.log("CENTERS :"+JSON.stringify(res.rows) );
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
        
        console.log(" Sending Email data :"+JSON.stringify(data))

        
        // send some mail
        
        transporter.sendMail(
          {            
            from: "RECORDATORIO-HORAS@123hora.com",
            to: data.email.toLowerCase()  ,
//            subject: "",
            subject: 'RECORDATORIO DE CITAS',
            html: data.message ,
            
            ses: {
              // optional extra arguments for SendRawEmail
            },
          },
          (info) => {
            console.log(cdate.toLocaleString()+":S0001:INFO:"+info);
          }
        );
        

  }

async function readHTMLFile(path) {
  const html_data = await fs.readFileSync(path,{encoding:'utf8', flag:'r'});
  return html_data
}

async function buildHtmlMessage(html,apps,centers){
console.log("CENTERS in BUILD HTML:"+JSON.stringify(centers))
  //1st build app list
  apps_html = new String()
 
  for (let i = 0; i < apps.length; i++) {
    let center = getCenterData(apps[i].center_id)
    apps_html =apps_html +"<tr> <td>"+await showSpecialtyName(apps[i].specialty_reserved)+"</td> <td>"+transform_date(apps[i].date)+"</td> <td>"+transform_time(apps[i].start_time)+"</td>   <td>"+center.name+"</td>    <td>"+apps[i].professional_id+"</td> </tr> ";
  }

  let aux = await html.replace('[appList]', apps_html)

  return aux
}

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
    console.log("MONTH:"+parseInt(month));
    let months = ['nodata','Enero','Febrero' ,'Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre' ]
    return months[parseInt(month)];
}







