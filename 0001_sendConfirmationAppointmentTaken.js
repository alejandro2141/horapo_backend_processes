/****************************************************  
//******  SCRIPT REQUIRE set {home} .aws/credentials 
// ****************************************************

[default]
aws_access_key_id = 
aws_secret_access_key = 
*/

let environment = "http://localhost:3000"
let path_html ="/home/alejandro/Documents/GitHub/backend_processes/email_notif_appointments_reserved.html"
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

html_template = await readHTMLFile(path_html)
specialties = await getSpecialties()
locations = await getLocations()

//  STEP 1 Get emails require recover appointments taken
let apps_list = await get_app_to_notif()
let apps_emails_list = apps_list.map(val => [val.patient_email, val.specialty_reserved]) 

console.log (cdate.toLocaleString()+":S0001:INFO:Appointment List to be notificated:"+JSON.stringify(apps_emails_list) )

if (apps_list !=null && apps_list.length > 0)
{
      let center_id_list = apps_list.map(val => val.center_id) 
      //remove duplicated
      let centers = await getCenters(center_id_list)
      //GET PROCESSIONAL
      let professional_id_list = apps_list.map(val => val.professional_id) 
      let professionals = await getProfessionals(professional_id_list)
      //  center_id_list.indexOf(apps.center_id) === -1 ? center_id_list.p

      if (apps_list != null)
        {
            for (let i = 0; i < apps_list.length; i++) {
                
                let center =await centers.find(elem => elem.id ==  apps_list[i].center_id  )
                let professional =await professionals.find(elem => elem.id ==  apps_list[i].professional_id  )

                let app_text="<br><hr><div><div><div><text style='font-size: 2.0em; color: #008080; padding: 0.0em;'>"+await showSpecialtyName(apps_list[i].specialty_reserved)+"</text></div><div><text style='font-size: 1.3em; color: #555;padding: 0.0em;' >"+transform_date(apps_list[i].date)+"</text></div><div><text style='font-size: 1.3em; color: #555;padding: 0.0em;' >"+transform_time(apps_list[i].start_time)+"</text></div></div><div><div>"+professional.name+"</div><div style='font-size: 1.0em; color: #333;'>"+center.address+"</div></div></div> " 
                 let aux_message = await html_template.replace('[appList]', app_text)

                let register = { 
                  'email' : apps_list[i].patient_email , 
                  'message' : aux_message 
                    }
              
                sendmail(register)
            }
        }// end if eamil_list 
}


}

//************************************************** 
//*********    FUNCTIONS             *************** 
//************************************************** 

// GET APPS TO NOTIF 
async function get_app_to_notif()
{
  const { Client } = require('pg')
  const client = new Client(conn_data)
  await client.connect()
 
  const sql_calendars  = "UPDATE  appointment SET patient_notification_email_reserved = 2 WHERE  patient_notification_email_reserved = 1 returning * " ;  
  //const sql_calendars  = "SELECT * FROM  appointment WHERE  patient_notification_email_reserved = 1  " ;  


  //console.log ("QUERY GET CALENDAR = "+sql_calendars);
  const res = await client.query(sql_calendars) 
  client.end() 
  return res.rows ;

}


//SEND MAIL 
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
       console.log(Date().toLocaleString()+":S0001:INFO:EMAIL to notif app :"+data.email.toLowerCase() )
        transporter.sendMail(
          {            
            from: "RESERVA@123hora.com",
            to: data.email.toLowerCase()  ,
            // subject: "",
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


async function readHTMLFile(path) {
  const html_data = await fs.readFileSync(path,{encoding:'utf8', flag:'r'});
  return html_data
}

async function showSpecialtyName(id){
  let temp= await specialties.find(elem => elem.id ==  id  )
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











/****************************************************  
//******  SCRIPT REQUIRE set {home} .aws/credentials 
// ****************************************************

[default]
aws_access_key_id = 
aws_secret_access_key = 
*/

/*
const { Pool, Client } = require('pg')

let cdate=new Date()

let conString = {
  user: 'conmeddb_user',
  host: '127.0.0.1',
  database: 'conmeddb02',
  password: 'paranoid',
  port: 5432,
    }

const client = new Client(conString) ; 


client.connect()
// ****** Run query to bring appointment
//const sql  = "SELECT * from  appointment WHERE  patient_notification_email_reserved = 1" ;
const sql  = "UPDATE  appointment SET patient_notification_email_reserved = 2 WHERE  patient_notification_email_reserved = 1 returning *" ;
//console.log('---> QUERY : '+sql ) ;
const resultado = client.query(sql, (err, result) => {
  if (err) {
      console.log(cdate.toLocaleString()+':ERROR:'+err ) ;
    }
  if (result != null)
    {
    console.log(cdate.toLocaleString()+":S0001: EMAIL Registers Found:"+result.rows.length )   
    // console.log("Registers Found:" +result.rows.length );
    //console.log("result in function:"+JSON.stringify(result.rows));
      if (result.rows.length >0 ){
           appToNotifyReserved(result.rows); 
          }
      else {
        //console.log("Empty List, No new Registers");
      }
    }
    client.end() ;
  })



  function appToNotifyReserved(list)
  {
    //console.log("Total EMAILS to be send : "+list.length );
     
    for ( i=0 ; i<= list.length ; i++ )
    {
      val=list.pop() ;
     

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
        
        // send some mail
        transporter.sendMail(
          {            
            from: "123HORA@123hora.com",
            to: val.patient_email.toLowerCase()  ,
//            subject: "",
            subject: 'Cita de ESPECIALIDAD '+val.specialty_reserved+' ha sido reservada para:'+val.date+', a las:'+val.start_time+'  ',
            text: 'Estimad@ '+val.patient_name+'.  Su reserva para '+val.specialty_reserved+' ha sido registrada el dia:'+val.date+' a las :'+val.start_time+' ha sido generada. Recuerde debe confirmar su asistencia 48 horas antes de la cita, de lo contrario su hora sera liberada para otros pacientes',
            ses: {
              // optional extra arguments for SendRawEmail
            },
          },
          (info) => {
            console.log(cdate.toLocaleString()+":S0001:INFO:"+info);
          }
        );

    }

}

*/













