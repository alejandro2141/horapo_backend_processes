const { Pool, Client } = require('pg')

console.log("0001 Send email confirmation Appointment Reserved");

const client = new Client({
  user: 'conmeddb_user',
  host: '127.0.0.1',
  database: 'conmeddb02',
  password: 'paranoid',
  port: 5432,
    })

client.connect()
// ****** Run query to bring appointment
const sql  = "SELECT * from  appointment where  app_reserved_notification_status is NULL  AND app_blocked = 99 AND app_available = false ;" ;
console.log('---> QUERY : '+sql ) ;
const resultado = client.query(sql, (err, result) => {

  if (err) {
      console.log('get_professional_specialty ERR:'+err ) ;
    }
    client.end()
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
                }
            });

      




    })


 
})

