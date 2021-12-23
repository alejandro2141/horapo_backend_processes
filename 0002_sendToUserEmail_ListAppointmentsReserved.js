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



/*
// 0 - THE START
getEmailList();
console.log ("START PROCESS 002");

// 1- GET EMAIL LIST 
async function getEmailList(){
  console.log("Obtaining Email List");
  const client = new Client(conString)
  client.connect()
  const res = await client.query('SELECT * FROM patient_recover_appointments ')
  //console.log(JSON.stringify (res.rows)) 
  client.end()
  processEmailList(res.rows);
  //return(res.rows);
}

//2 - PROCESS EMAIL LIST  
async function processEmailList(list){
    console.log ("Process List ");
       // console.log("List:" + JSON.stringify(list)) ;
        console.log("Largo :" + list.length  ) ;

        for (i=0 ; i< list.length ; i++)
        {
         console.log("Email : "+list[i].email+" ");
         getAppByEmail() ;
        }

}

// 3 - GET APPOINTMENT Email ID
async function getAppByEmail(){
  
  console.log("getAppByEmail:");
 
  let getAppQuery = "SELECT * FROM appointment where patient_email = '"+email+"' AND  date >= '"+todayDate+"' " ; 
  console.log("query: "+getAppQuery);
  
  const client = new Client(conString)
  client.connect()
  const res1 = await client.query(getAppQuery)
  console.log(JSON.stringify (res1.rows)) 
  client.end()

  console.log("Sending email to : "+email);
  console.log("Appointments : "+JSON.stringify(res1.rows));   
       sendEmail(email,res1.rows);
       

}

async function getAppByEmail(email, apps){
  

}
*/

