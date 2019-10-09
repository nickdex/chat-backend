const axios = require('axios').default;

const { Suggestion, Text } = require('dialogflow-fulfillment');
const http = axios.create({ baseURL: process.env.BACKEND_URL });

function handleUserName(agent) {
  const name = agent.parameters['domestic-name'];

  return http.get('/user').then(result => {
    if (!result.data) {
      agent.add(`${name}, We don't have you registered`);
      agent.add(`Would you like to start registration?`);
      return;
    }
    agent;
    agent.add(
      new Text({
        text: `Welcome ${name}, what's your organization name?`,
        platform: 'ACTIONS_ON_GOOGLE'
      })
    );
  });
}

function handleOrganizationName(agent) {
  const registration = agent.getContext('registration');
  const { username, organization, product } = registration.parameters;

  return http
    .post('user', { FirstName: username, DataBaseName: organization })
    .then(() => {
      agent.add('Congrats, you have been business has been created.');
    })
    .catch(error => {
      console.error('Super user creation failed');
    });
}

function suggestProducts(agent) {
  let productTypes = [];
  agent.add('Which business do you want to start?');

  return http
    .get('/Database/StoreType')
    .then(result => {
      if (!result.data) throw new Error();

      productTypes = result.data || ['apparel', 'grocery'];
    })
    .finally(() => {
      productTypes.forEach(p => agent.add(new Suggestion(p)));
    });
}

function handleUserCreation(agent) {
  const userCreation = agent.getContext('user-creation');
  const { username, phone, age, email, organization } = userCreation.parameters;

  return http
    .post('user', {
      UserName: username,
      Phone: phone,
      Age: age,
      Email: email,
      DataBaseName: organization
    })
    .then(() => {
      agent.add(`${username} has been created!`);
      return suggestProducts(agent);
    });
}

function handleProductCreation(agent) {
  const productCreation = agent.getContext('product-creation');
  const { price, quantity, name, organization } = productCreation;

  return http
    .post('product', {
      ProductName: name,
      Quantity: quantity,
      Price: price,
      DataBaseName: organization
    })
    .then(() => {
      agent.add('Your product item has been added');
    });
}

module.exports = {
  handleUserName,
  handleOrganizationName,
  handleUserCreation,
  handleProductCreation
};
