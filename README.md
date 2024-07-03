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


#CRON PROCESS FOR INTERCAMBIAR
*/1 * * * * /home/alejandro/.nvm/versions/node/v18.14.0/bin/node /home/alejandro/Documents/GitHub/trocalo_processes/0001_register_send_email_confirmation.js  >> /var/log/intercambiarlog/last.log
*/1 * * * * /home/alejandro/.nvm/versions/node/v18.14.0/bin/node /home/alejandro/Documents/GitHub/trocalo_processes/0002_notification_new_proposal_source.js  >> /var/log/intercambiarlog/last.log
*/1 * * * * /home/alejandro/.nvm/versions/node/v18.14.0/bin/node /home/alejandro/Documents/GitHub/trocalo_processes/0003_notification_new_proposal_destination.js  >> /var/log/intercambiarlog/last.log
*/1 * * * * /home/alejandro/.nvm/versions/node/v18.14.0/bin/node /home/alejandro/Documents/GitHub/trocalo_processes/0004_notification_proposal_accepted_destination.js  >> /var/log/intercambiarlog/last.log
*/1 * * * * /home/alejandro/.nvm/versions/node/v18.14.0/bin/node /home/alejandro/Documents/GitHub/trocalo_processes/0005_notification_proposal_accepted_source.js  >> /var/log/intercambiarlog/last.log
*/1 * * * * /home/alejandro/.nvm/versions/node/v18.14.0/bin/node /home/alejandro/Documents/GitHub/trocalo_processes/0006_notification_proposal_accepted_source.js  >> /var/log/intercambiarlog/last.log
*/1 * * * * /home/alejandro/.nvm/versions/node/v18.14.0/bin/node /home/alejandro/Documents/GitHub/trocalo_processes/0007_notification_proposal_inTransfer_source.js  >> /var/log/intercambiarlog/last.log
*/1 * * * * /home/alejandro/.nvm/versions/node/v18.14.0/bin/node /home/alejandro/Documents/GitHub/trocalo_processes/00011_expire_proposals.js  >> /var/log/intercambiarlog/last.log
*/1 * * * * /home/alejandro/.nvm/versions/node/v18.14.0/bin/node /home/alejandro/Documents/GitHub/trocalo_processes/00012_expire_proposals_accepted.js  >> /var/log/intercambiarlog/last.log



