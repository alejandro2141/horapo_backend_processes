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

          //accessKeyId: cfg.KEY,
          //secretAccessKey: cfg.SKEY,
          //accessKeyId : "AKIAZX6HYCD6WJFLIVUF",
          //secretAccessKey : "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",
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

/*
function updateRegisterToNotified(val)
{
 
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

 
}
*/

