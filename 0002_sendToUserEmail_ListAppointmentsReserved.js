
/*
async function executeAsyncTask () {
  console.log("Execute A")
  const valueA = await functionA();
  console.log("Execute B")
  const valueB = await functionB(valueA);
  console.log("Return")
  return (valueB);
}

async function functionA()
{ 
await sleep(2000);
console.log("soyA")
return ("soyA")
}

async function functionB(val)
{
console.log("soyB")
return (val+" soyB") 
}


const sleep = async (milliseconds) => {
  await new Promise(resolve => {
      return setTimeout(resolve, milliseconds)
  });
}


console.log("START")
let resultado=executeAsyncTask()
*/



const { Pool, Client } = require('pg')
let email_apps_list = null 
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

//STEP 1 Get emails require recover appointments taken
let email_list = await get_emailsRequestRecoverAppointments()
//SETP 2 Get all appointments registered for each email
for (var i = 0; i < email_list.length; i++) {

  let apps =  getAppointmentsByEmail(email_list[i])
  email_apps_list


}




return email_list ;

}

//************************************************** 
//*********    FUNCTIONS             *************** 
//************************************************** 

async function  get_emailsRequestRecoverAppointments()
{
  const { Client } = require('pg')
  const client = new Client(conn_data)
  await client.connect()
 
  const sql_calendars  = "SELECT * FROM patient_recover_appointments" ;  

  //console.log ("QUERY GET CALENDAR = "+sql_calendars);
  const res = await client.query(sql_calendars) 
  client.end() 
  console.log("Return email request")
  return res.rows ;
}
















function sendmail(data)
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
        
        // send some mail
        transporter.sendMail(
          {            
            from: "123HORA-RECORDATORIO@123hora.com",
            to: data.patient_email.toLowerCase()  ,
//            subject: "",
            subject: 'RECORDATORIO DE CITAS : '+val.email+'   ',
            text: 'RECORDATORIO DE CITAS : '+val.email+'  ' ,
            ses: {
              // optional extra arguments for SendRawEmail
            },
          },
          (info) => {
            console.log(cdate.toLocaleString()+":S0001:INFO:"+info);
          }
        );



  }


function getAppointmentsByEmail(email){
  
  const client = new Client(conString)
  client.connect()

  //let sql_query= "SELECT * FROM appointment WHERE patient_email = '"+email+"' AND  date >= '"+todayDate+"'  " ;

  let sql_query= "SELECT * FROM appointment  WHERE patient_email = '"+email+"' ";

  // console.log("sql_query:"+sql_query); 
  client.query(sql_query, (err, res) => {
    if (err) throw err
    //console.log(res.rows)
     client.end()
     return res.rows
  }) 
}





//************************OLD CODE **************************** */

/*

const { Client } = require('pg')

let conString = {
  user: 'conmeddb_user',
  host: '127.0.0.1',
  database: 'conmeddb02',
  password: 'paranoid',
  port: 5432,
    }


    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth() + 1; 
    const year = date.getFullYear();
    const todayDate = year+"-"+month+"-"+day;

let elist= null ; 

//STEP  1 GET THE EMAIL LIST
    const client = new Client(conString)
    client.connect()
    client.query('SELECT * FROM patient_recover_appointments', (err, res) => {
      if (err) throw err
      console.log(res.rows)
      processEmailList(res.rows);
      //elist = res.rows
      client.end()
    })

//STEP 2 PROCESS LIST
function processEmailList(list){
         console.log("EMAILS TOTAL TO PROCESS :" + list.length  ) ;
         for (i=0 ; i< list.length ; i++)
          {
          // console.log("Email : "+list[i].email+" ");
           getAppByEmail(list[i].email) ;
          }
  
  }
//STEP 3 GET APPS BY EMAIL. 
function getAppByEmail(email){
  
      const client = new Client(conString)
      client.connect()

      //let sql_query= "SELECT * FROM appointment WHERE patient_email = '"+email+"' AND  date >= '"+todayDate+"'  " ;
    
      let sql_query= "SELECT * FROM (SELECT * FROM appointment  WHERE patient_email = '"+email+"' AND  date >= '"+todayDate+"' )J  LEFT JOIN specialty ON J.specialty = specialty.id";
    
      // console.log("sql_query:"+sql_query); 
      client.query(sql_query, (err, res) => {
        if (err) throw err
        //console.log(res.rows)
        sendEmail(email,res.rows);
        client.end()
      }) 
  }

//STEP 4 SEND EMAIL TO USER. 
function sendEmail(email,appointments){
    console.log(" sending email to:"+email );  
    let message="Estimad@ Cliente <br> Sus reservas registradas con el correo :"+email+"<br> " ;

    if (appointments.length>0)
    {
          //concat APPOINTMENTS
          for (i=0; i<appointments.length ; i++ )
          {
            val=appointments.pop() ;  
            message = message + " Su reserva para "+val.name+" ha sido registrada el dia:"+val.date+ " a las :"+val.start_time+"  " ;
          }
    }
    else
    {
      message = message + " No existen reservas en nuestros registros " ;
    }

    message = message + " Recuerde reservar sus citas 48 horas antes" ;
  
    //START SENDMAIL 
  
        var nodemailer = require('nodemailer');
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
            user: 'ing.morales@gmail.com',
            pass: 'cshbjfqevdyceras'
            }
        });
        
        var mailOptions = {
            from: 'ing.morales@gmail.com',
            to: email ,
            subject: '123HORA Resumen de sus citas reservadas:',
            text: 'Gracias por preferirnos ' ,
            html: message , 
        };
        
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
            //console.log(error);
            console.log('Email: '+email+' Result ERROR :' + error);
            } else {
            console.log('Email: '+email+' Result:' + info.response);
            updateRegisterToNotified(email) ;
                 }
          })
      //END SEND MAIL 
}

//STEP 5 GET APPS BY EMAIL. 
function updateRegisterToNotified(email){
  
  const client = new Client(conString)
  client.connect()
  let sql_query= "DELETE FROM patient_recover_appointments WHERE email = '"+email+"' ";
  // console.log("sql_query:"+sql_query); 
  client.query(sql_query, (err, res) => {
    if (err) throw err
    //console.log(res.rows)
    client.end()
  }) 
}

*/
