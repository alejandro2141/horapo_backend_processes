
const { Pool, Client } = require('pg')

//*** global variables ***/
let cdate=new Date()
let conString = {
  user: 'conmeddb_user',
  host: '127.0.0.1',
  database: 'conmeddb02',
  password: 'paranoid',
  port: 5432,
    }
//************************/

let response = recoverAppointments();
response.then( v => {  console.log("End Steps  "+JSON.stringify(v))  } )






//**************************************************/
//*********      FUNCTIONS           ***************/
//**************************************************/
async function  recoverAppointments()
{
//Step 1, Get all EMails request Recover appointments taken
console.log("Step1");

let email_list = await get_emailsRequestRecoverAppointments()

console.log("Step2:"+email_list);

return email_list ;

}


async function  get_emailsRequestRecoverAppointments()
{
  const client = new Client(conString) ; 
  client.connect()
  // ****** Run query to bring appointment
  //const sql  = "SELECT * from  appointment WHERE  patient_notification_email_reserved = 1" ;
  const sql  = "DELETE FROM patient_recover_appointments  RETURNING * " ;
  //console.log('---> QUERY : '+sql ) ;
  const resultado = client.query(sql, (err, result) => {
    if (err) {
        console.log(cdate.toLocaleString()+'::S0002:ERROR:'+err ) ;
        return null
      }
    if (result != null)
      {
       
      //console.log("result in function:"+JSON.stringify(result.rows));
        if (result.rows.length >0 ){
         client.end() ;
         console.log(cdate.toLocaleString()+":S0002: EMAILS recover:"+result.rows.length ) 
         return (result.rows); 
        }

        else {
          console.log(cdate.toLocaleString()+":S0002: EMAILS recover No Emails:") 
          client.end() ;
          return null
          //console.log("Empty List, No new Registers");
        }

      }
      

    })

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


function getAppByEmail(email){
  
  const client = new Client(conString)
  client.connect()

  //let sql_query= "SELECT * FROM appointment WHERE patient_email = '"+email+"' AND  date >= '"+todayDate+"'  " ;

  let sql_query= "SELECT * FROM (SELECT * FROM appointment  WHERE patient_email = '"+email+"' )J  LEFT JOIN specialty ON J.specialty = specialty.id";

  // console.log("sql_query:"+sql_query); 
  client.query(sql_query, (err, res) => {
    if (err) throw err
    //console.log(res.rows)
     client.end()
     return res.rows
  }) 
}





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
