const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const { WebhookClient } = require('dialogflow-fulfillment');

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const {
  handleUserName,
  handleOrganizationName,
  handleUserCreation,
  handleProductCreation
} = require('./handlers/handlers');

function webHookProcessing(request, response) {
  const agent = new WebhookClient({ request, response });
  console.info(`agent set`);
  let intentMap = new Map();
  intentMap.set('user.name', handleUserName);
  intentMap.set('user.organization', handleOrganizationName);
  intentMap.set(
    'user.create.phone --context:user-creation',
    handleUserCreation
  );
  intentMap.set(
    'retail.product.create.quantity --context:product-creation',
    handleProductCreation
  );
  agent.handleRequest(intentMap);
}

app.post('/webhook', (req, res) => {
  webHookProcessing(req, res);
});

app.listen(process.env.PORT || 8000, function() {
  console.log('Server is up and listening on port ' + process.env.PORT);
});
