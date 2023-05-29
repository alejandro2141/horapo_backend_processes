# backend_processes

Backend Processes require run in HORAPO

To send emails frist create in user home: 
/.aws/credentials
include in credentials file: 
[default]
aws_access_key_id = ----
aws_secret_access_key = ....

Add to contrab the scripts required: 
Crontab -e

*/1 * * * * /home/ubuntu/.nvm/versions/node/v14.18.0/bin/node /home/ubuntu/code/backend_processes/0001_sendConfirmationAppointmentTaken.js >> /var/log/123hora/last.log
*/1 * * * * /home/ubuntu/.nvm/versions/node/v14.18.0/bin/node /home/ubuntu/code/backend_processes/0002_sendToUserEmail_ListAppointmentsReserved.js >> /var/log/123hora/last.log
*/1 * * * * /home/ubuntu/.nvm/versions/node/v14.18.0/bin/node /home/ubuntu/code/backend_processes/0003_sendRequestAppConfirmation.js >> /var/log/123hora/last.log
*/1 * * * * /home/ubuntu/.nvm/versions/node/v14.18.0/bin/node /home/ubuntu/code/backend_processes/0004_sendCalendarToPatient.js >> /var/log/123hora/last.log
*/1 * * * * /home/ubuntu/.nvm/versions/node/v14.18.0/bin/node /home/ubuntu/code/backend_processes/0005_send_notification_patient_appointment_cancelled.js >> /var/log/123hora/last.log
*/1 * * * * /home/ubuntu/.nvm/versions/node/v14.18.0/bin/node /home/ubuntu/code/backend_processes/0006_send_invitation_to_professional.js >> /var/log/123hora/last.log

