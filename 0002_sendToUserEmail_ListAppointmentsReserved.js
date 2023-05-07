/****************************************************  
//******  SCRIPT REQUIRE set {home} .aws/credentials 
// ****************************************************

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

html_template = await readHTMLFile(__dirname+"/0002_sendToUserEmail_ListAppointmentsReserved.html")
specialties = await getSpecialties()
locations = await getLocations()

//  STEP 1 Get emails require recover appointments taken
let email_list = await get_emailsRequestRecoverAppointments()
console.log (cdate.toLocaleString()+":S0002:INFO:EMAILS RECOVER Appointments:"+JSON.stringify(email_list) )
if (email_list != null && email_list.length > 0 )
{

    // WHILE  STEP 2 Get all appointments registered for each email
      while  (email_list.length > 0) {
      let aux_email= email_list.pop()
      
      let register = { 
            'email' : aux_email.email , 
            'message' : "<h1>noData</h1>"
          }
      let apps = await getAppointmentsByEmail(aux_email.email) 
        
        if (apps != null && apps.length > 0 )
        {
          // SETP 3  : FORMAT LIST Appointments
            //GET CENTERS
            let center_id_list = apps.map(val => val.center_id) 
            //remove duplicated
            let aux_centers = await getCenters(center_id_list)
            //GET PROCESSIONAL
            let professional_id_list = apps.map(val => val.professional_id) 
            let aux_professinals = await getProfessionals(professional_id_list)
            //  center_id_list.indexOf(apps.center_id) === -1 ? center_id_list.push(apps.center_id) : console.log("");
          
            //register.apps = html_data_email 
          
            //push to app list
            register.message = await buildHtmlMessage(html_template,apps,aux_centers,aux_professinals)
            email_apps_list.push(register) 
        }
        else 
        {
          let register = { 
            'email' : aux_email.email , 
            'message' : "<h1> [No Existen Citas Agendadas] </h1>"
          }
          email_apps_list.push(register) 

        }
      
      }
    //END WHILE

      //GET CENTERS by  center_id_list TO THEN SEARCH center name and address
      //console.log("EMAILS TO BE SENT:"+JSON.stringify(email_apps_list) )
      // STEP 3   Send emails suing list email_apps_list
      while (email_apps_list.length >0 ) 
      {
        let register = email_apps_list.pop()
         await sendmail(register)
      }

}// end if eamil_list 
  



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
 
  const sql_calendars  = "DELETE FROM patient_recover_appointments RETURNING * " ;  

  //console.log ("QUERY GET CALENDAR = "+sql_calendars);
  const res = await client.query(sql_calendars) 
  client.end() 
  return res.rows ;
}

async function getAppointmentsByEmail(email){
 if (email != null  )
 {
  const { Client } = require('pg')
  const client = new Client(conn_data)
  await client.connect()
  
  const sql_calendars  = "SELECT * FROM appointment WHERE upper(patient_email)= upper('"+email+"') AND date > '"+today.toISOString()+"' ";  

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

async function getCenters(ids){
  if (ids !=null  && ids.length > 0 )
  {
  const { Client } = require('pg')
  const client = new Client(conn_data)
  await client.connect()
  
  const sql_centers  = "SELECT * FROM center WHERE id IN ("+ids+") " ;  
  
  //console.log("CENTERS IDS:"+sql_centers);
  const res = await client.query(sql_centers) 
  //console.log("CENTERS :"+JSON.stringify(res.rows) );
  client.end() 
  return res.rows ;
  }
  else 
  {
    return null 
  } 
  
}

async function getProfessionals(ids){
  const { Client } = require('pg')
  const client = new Client(conn_data)
  await client.connect()
  const sql_centers  = "SELECT * FROM professional WHERE id IN ("+ids+") " ;  
  
  const res = await client.query(sql_centers) 
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
       console.log(cdate.toLocaleString()+":S0002:INFO:EMAILS to send:"+data.email.toLowerCase() )
        transporter.sendMail(
          {            
            from: "horapo-recordatorio@horapo.com",
            to: data.email.toLowerCase()  ,
//            subject: "",
            subject: 'Recordatorio de citas '+transform_date(cdate),
            html: data.message ,
            
            ses: {
              // optional extra arguments for SendRawEmail
            },
          },
          (info) => {
            console.log(cdate.toLocaleString()+":S0002:INFO:"+info);
          }
        );
   

  }

async function readHTMLFile(path) {
  const html_data = await fs.readFileSync(path,{encoding:'utf8', flag:'r'});
  return html_data
}

async function buildHtmlMessage(html,apps,centers,professionals){
//console.log("CENTERS in BUILD HTML:"+JSON.stringify(centers))
  //1st build app list
  apps_html = new String()
 
  for (let i = 0; i < apps.length; i++) {
    let center =await centers.find(elem => elem.id ==  apps[i].center_id  )
    let professional =await professionals.find(elem => elem.id ==  apps[i].professional_id  )
    //apps_html =apps_html +"<tr><td style='font-size: 1.5em; color: #008080;' > <br> "+await showSpecialtyName(apps[i].specialty_reserved)+"</td><td>"+transform_date(apps[i].date)+"</td><td>"+transform_time(apps[i].start_time)+"</td><td>"+professional.name+"</td><td style='font-size: 1.0em; color: #333;'>"+center.address+"</td></tr> ";
    apps_html =apps_html +"<br><hr><div><div><div><text style='font-size: 1.7em; color: #2A8711;'>"+await showSpecialtyName(apps[i].specialty_reserved)+"</text></div><div><text style='font-size: 1.3em; color: #555;padding: 0.0em;' ><h2>"+transform_date(apps[i].date)+"</h2></text></div><div><text style='font-size: 1.3em; color: #555;padding: 0.0em;' ><h2>"+transform_time(apps[i].start_time)+"</h2></text></div></div><div><div>"+professional.name+"</div><div style='font-size: 1.0em; color: #333;'>"+center.address+"</div></div></div> <p><A style='padding: 1.0em ;margin:1.0em ; color: rgb(255, 255, 255); text-decoration: none;  background-color: #7e0000;'   HREF='"+FRONT_HOST+"/nested/confirmApp.html?params=112233_"+apps[i].id+"_"+apps[i].center_id+"_"+apps[i].patient_doc_id+"_ca'>Cancelar</a><A style='padding: 1.0em ;margin:1.0em ; color: rgb(255, 255, 255); text-decoration: none; background-color: #4f7900;'   HREF='"+FRONT_HOST+"/nested/confirmApp.html?params=112233_"+apps[i].id+"_"+apps[i].center_id+"_"+apps[i].patient_doc_id+"_co'>Confirmar</a></p>" 
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
    //console.log("MONTH:"+parseInt(month));
    let months = ['nodata','Enero','Febrero' ,'Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre' ]
    return months[parseInt(month)];
}







