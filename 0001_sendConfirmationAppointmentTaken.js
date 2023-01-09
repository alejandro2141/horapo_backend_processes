const { Pool, Client } = require('pg')

console.log("0001 Send email confirmation Appointment Reserved");

let conString = {
  user: 'conmeddb_user',
  host: '127.0.0.1',
  database: 'conmeddb02',
  password: 'paranoid',
  port: 5432,
    }

const client = new Client(conString) ; 

/*
const client = new Client({
  user: 'conmeddb_user',
  host: '127.0.0.1',
  database: 'conmeddb02',
  password: 'paranoid',
  port: 5432,
    })
*/

client.connect()
// ****** Run query to bring appointment
//const sql  = "SELECT * from  appointment WHERE  patient_notification_email_reserved = 0  AND app_blocked = 0 AND app_available = false  " ;
const sql  = "SELECT * from  appointment WHERE  patient_notification_email_reserved = 1 " ;

console.log('---> QUERY : '+sql ) ;

const resultado = client.query(sql, (err, result) => {
  if (err) {
      console.log('ERR:'+err ) ;
    }
  if (result != null)
    {  
      console.log("Registers Found:" +result.rows.length );
    //console.log("result in function:"+JSON.stringify(result.rows));
      if (result.rows.length >0 ){
           appToNotifyReserved(result.rows); }
      else {
        console.log("Empty List, No new Registers");
      }
    
    }
    client.end() ;
  })



  function appToNotifyReserved(list)
  {
    console.log("continueToUpdate function. "+JSON.stringify(list));
    console.log("Total EAMILS to be send : "+list.length );
     
    for ( i=0 ; i<= list.length ; i++ )
    {
      /*
      val=list.pop() ;
      console.log("Sending email to :"+ val.patient_email  );

      let message="Estimad@ <b>"+val.patient_name+"</b> <br> Su reserva para [ESPECIALIDAD] ha sido registrada el dia:"+val.date+ " a las :"+val.start_time+" ha sido generada<br> Recuerde debe confirmar su asistencia 48 horas antes de la cita, de lo contrario su hora sera liberada para otros pacientes" ;
      
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
          to: val.patient_email ,
          subject: 'Cita de ESPECIALIDAD ha sido reservada para:'+val.date+', a las:'+val.start_time+'  ',
          text: 'Gracias por preferirnos '+val.patient_name ,
          html: message , 
      };
      
      transporter.sendMail(mailOptions, function(error, info){
          if (error) {
          console.log(error);
          } else {
          console.log('Email sent: ' + info.response);
          updateRegisterToNotified(val) ;
               }
        })
        */
    

        let nodemailer = require("nodemailer");
        let aws = require("@aws-sdk/client-ses");
        let { defaultProvider } = require("@aws-sdk/credential-provider-node");
        
        const ses = new aws.SES({
          apiVersion: "2010-12-01",
          region: "us-east-1",
          defaultProvider,
        });
        
        // create Nodemailer SES transporter
        let transporter = nodemailer.createTransport({
          SES: { ses, aws },
        });
        
        // send some mail
        transporter.sendMail(
          {
            from: "noreply@123hora.com",
            to: "alejandro2141@gmail.com",
            subject: "Message",
            text: "I hope this message gets sent!",
            ses: {
              // optional extra arguments for SendRawEmail
              Tags: [
                {
                  Name: "tag_name",
                  Value: "tag_value",
                },
              ],
            },
          },
          (info) => {
            console.log("INFO:"+info);
          }
        );

    }

}


function updateRegisterToNotified(val)
{
 //************ */
 //client.connect()
 
 let sql_update  = "UPDATE appointment SET patient_notification_email_reserved = 1  WHERE id="+val.id+" ;" ;
 console.log('--->UPDATE APP QUERY : '+sql_update ) ;

 const client_update = new Client(conString) ;
 client_update.connect() ;
 const resultado = client_update.query(sql_update, (err, result) => {
  if (err) {
      console.log('ERR:'+err ) ;
    }
    console.log("updated Result" + result);
    client_update.end() ;
  })

 //*************** */
}


// CLOSE CLIENT
 

//console.log("LIST="+JSON.stringify(list) ) ;

  /*
//  console.log('---> Emails Pending to send  : '+JSON.stringify(result.rows) ) ;
  console.log("START SUMMARY EMAILS");
  result.rows.forEach( (value)=>console.log("all :"+JSON.stringify(value)) );
  console.log("END SUMMARY EMAILS");

  //FREACH CYCLE TO SEND NOTIFICATION TO CUSTOMER
  result.rows.forEach(function(val) {
  console.log("sending Confirmation Appointment Taken to email:"+val.patient_email);
    
  let message="Estimad@ <b>"+val.patient_name+"</b> <br> Su reserva para xxxx  el dia:"+val.date+ " a las :"+val.start_time+" ha sido generada<br> Recuerde debe confirmar su asistencia 48 horas antes de la cita, de lo contrario su hora sera liberada para otros pacientes" ;

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
                to: val.patient_email ,
                subject: 'Cita de ESPECIALIDAD ha sido reservada para:'+val.date+', a las:'+val.start_time+'  ',
                text: 'Gracias por preferirnos '+val.patient_name ,
                html: message , 
            };
            
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                console.log(error);
                } else {
                console.log('Email sent: ' + info.response);

                //Now we should update DB to reflect email sent. 
                client.connect()
                const sql  = "UPDATE appointment SET patient_notification_email_reserved = 1  WHERE id=1385 ;" ;
                console.log('--->UPDATE APP QUERY : '+sql ) ;
                const resultado = client.query(sql, (err, result) => {
                  if (err) {
                      console.log('get_professional_specialty ERR:'+err ) ;
                    }
                client.end() ;
                 
                //END UPDATE DATABASE                 


                }
            });

      




    })


 
})

*/

