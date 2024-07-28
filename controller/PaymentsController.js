//const Paystack = require('paystack') // Import the Paystack library;
const User = require('../model/User')


const Paystack = require('paystack-api') // Import the Paystack library;

//const  Paystack  = require('@paystack/paystack-sdk')


const crypto = require('crypto')

const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY) // Create a new Paystack instance

const handleGetAllPlans = async (req, res) => {
    const fetchedPlans = await paystack.plan.list({})

    if (fetchedPlans.status === false) {
        console.log('Error fetching all Plans', fetchedPlans.message)
        return res.status(400).send(`Error fetching plans:${fetchedPlans.message}`)
    }
    return res.status(200).send(fetchedPlans.data)
}

//get
const handleGetSubscription = async (req, res) => {
  try {

      // const { email } = req.body
      const { email } = req.params

      console.log(email)


      if (!email) {
          throw Error('Please include a valid customerID')
      }

      console.log('EMAIL', email)

      //const fetchedSubscription = await paystack.subscription.list({
      const fetchedSubscription = await paystack.subscription.list({
        email
      })

      // console.log('SubscriberStatus:',fetchedSubscription)

      if (fetchedSubscription.status === false) {
          console.log('Error fetching subscriptions', fetchedSubscription.message)
          return res.status(400).send(`Error fetching subscriptions:${fetchedSubscription.message}`)
      }
      // const subscriptions = fetchedSubscription.data.filter(
      //     (subscription) =>
      //         subscription.status === 'active' ||
      //         subscription.status === 'non-renewing'
      // )

      const subscriptions = fetchedSubscription.data.filter(
        (subscription) =>
            subscription.customer.email === email 
    )

      console.log('SUBSCRIPTIONS', subscriptions)

      return res.status(200).send(subscriptions)

  } catch (error) {
      console.log(error)
      return res.status(400).send(error.message)
  }
}

// const handleUpdateUserSubscriptionStatus = async (req, res) => {
//   try {

//       // const { email } = req.body
//       const { email } = req.params

//       console.log(email)


//       if (!email) {
//           throw Error('Please include a valid customerID')
//       }

//       console.log('EMAIL', email)

//       //const fetchedSubscription = await paystack.subscription.list({
//       const fetchedSubscription = await paystack.subscription.list({})

//       // console.log('SubscriberStatus:',fetchedSubscription)

//       if (fetchedSubscription.status === false) {
//           console.log('Error fetching subscriptions', fetchedSubscription.message)
//           return res.status(400).send(`Error fetching subscriptions:${fetchedSubscription.message}`)
//       }
//       // const subscriptions = fetchedSubscription.data.filter(
//       //     (subscription) =>
//       //         subscription.status === 'active' ||
//       //         subscription.status === 'non-renewing'
//       // )

//       const subscriptions = fetchedSubscription.data.filter(
//         (subscription) =>
//             subscription.customer.email === email 
//     )
//     const user = await User.findOne({email})

//     if(user && subscriptions.status === active){
//       user.subscribed = true

//       await user.save()
//     }


//       console.log('SUBSCRIPTIONS', subscriptions)

//       console.log('USERDATA:', user)

//       return res.status(200).send(subscriptions)

//   } catch (error) {
//       console.log(error)
//       return res.status(400).send(error.message)
//   }
// }

//post
const initializeSubscriptionWithPlan = async(req, res) =>{
    try{

        const { email, amount, plan } = req.body;

        console.log('email', email)
        console.log('amount', amount)
        console.log('plan', plan)

        if (!email || !amount || !plan) {
          throw Error(
            'Please provide a valid customer email, amount to charge, and plan code'
          )
        }

        const initializeTransaction = await paystack.transaction.initialize({
            email,
            amount,
            plan,
            channels: ['card'],
            callback_url: `${process.env.CLIENT_URL}/isSubscribed`,
          })

          if (initializeTransaction.status === false) {
            return console.log(
              'Error initializing transaction: ',
              initializeTransaction.message
            );
          }

          const transaction = initializeTransaction.data;
          console.log('transaction:', transaction)
          console.log('initialize', initializeTransaction)
          return res.status(200).send(transaction);


    } catch (error) {
        console.log(error)
        return res.status(400).send(error.message)
    }
}

//post
const handleCreateSubscription = async(req, res) =>{
    try{

    const { customer, plan, authorization, start_date } = req.body;

    if (!customer || !plan) {
      throw Error('Please provide a valid customer code and plan ID');
    }

    const createSubscription = await paystack.subscription.create({
        customer,
        plan,
        authorization,
        start_date,
      })

    if (createSubscription.status === false) {
        return console.log(
          'Error creating subscription: ',
          createSubscription.message
        );
      }

    const subscription = createSubscription.data;
    return res.status(200).send(subscription);

    } catch(error) {
        console.log(error)
        return res.status(400).send(error.message)
    }
}

//post
// const handleCancelSubscription = async(req, res) =>{
//     try{

//        // let { code, token } = req.body;
//        let { subscription_code, email } = req.body;


//         console.log('subscription_code', subscription_code)
//         console.log('email', email)

//         if (!subscription_code || !email) {
//           throw Error(
//             'Please provide a valid customer code and subscription token'
//           );
//         }

//         const disableSubscriptionResponse = await paystack.subscription.disable({
//             subscription_code,
//             email,
//           });
//           console.log('DISABLED')

//           return res.status(200).send('Subscription successfully disabled')

//     } catch(error) {
        
//         return res.status(400).send(error)

//     }
// }

const handleCancelSubscription = async (req, res) => {
  try {
    const { subscription_code, emailToken, email} = req.body;
    console.log(subscription_code)
    console.log(emailToken)


    // Enhanced validation
    if (!subscription_code || !emailToken) {
      return res.status(400).send('Please provide a valid subscription code and email');
    }

    // Call Paystack API with error handling
    const disableSubscriptionResponse = await paystack.subscription.disable({
      code: subscription_code,
      token: emailToken,
    });

    const user = await User.findOne({email})

    // Log complete API response for debugging
    console.log('disableSubscriptionResponse:', disableSubscriptionResponse);

    if (disableSubscriptionResponse.status === false) {
      // Handle Paystack API errors
      return res.status(400).send(disableSubscriptionResponse.message);
    }

    if(user){
      user.subscribed = false

      await user.save()

  } else res.status(404).json('User not found!!!') 


    return res.status(200).send('Subscription successfully disabled');
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return res.status(500).send('An error occurred while cancelling the subscription');
  }
};


const handleUpdatePaymentMethod = async(req, res) =>{
    try {
    
        const { subscription_code } = req.params;

        console.log('subscription_code', subscription_code)

        const manageSubscriptionLinkResponse = await paystack.subscription.manageLink({
            code: subscription_code,
          })

          if (manageSubscriptionLinkResponse.status === false) {
            console.log(manageSubscriptionLinkResponse.message)
          }
      
        const manageSubscriptionLink = manageSubscriptionLinkResponse.data.link
          return res.redirect(manageSubscriptionLink)

    } catch (error) {
        console.log(error)
    }
}

//post
const handleCreateCustomer = async(req, res) =>{
    try {
        
        const { email } = req.body;

        if (!email) {
            throw Error('Please include a valid email address');
        }

        const createCustomer = await paystack.customer.create({
            email,
        })

        if (createCustomer.status === false) {
            console.log('Error creating customer: ', createCustomer.message);
            return res
              .status(400)
              .send(`Error creating customer: ${createCustomer.message}`);
          }

          const customer = createCustomer.data
          res.cookie('customer', customer.customer_code);
          return res.status(200).send(customer);

    } catch (error) {
        
    }
}

const handleWebhooks = async(req, res)=>{
    const hash = crypto
    .createHmac('sha512', secret)
    .update(JSON.stringify(req.body))
    .digest('hex');

    if (hash == req.headers['x-paystack-signature']) {
        const webhook = req.body
        res.status(200).send('Webhook received')
    
        switch (webhook.event) {
          case 'subscription.create': // Sent when a subscription is created successfully
          case 'charge.success': // Sent when a subscription payment is made successfully
          case 'invoice.create': // Sent when an invoice is created to capture an upcoming subscription charge. Should happen 2-3 days before the charge happens
          case 'invoice.payment_failed': // Sent when a subscription payment fails
          case 'subscription.not_renew': // Sent when a subscription is canceled to indicate that it won't be charged on the next payment date
          case 'subscription.disable': // Sent when a canceled subscription reaches the end of the subscription period
          case 'subscription.expiring_cards': // Sent at the beginning of each month with info on what cards are expiring that month
        }
      }
}

module.exports={
    handleGetAllPlans,
    handleGetSubscription,
    handleCancelSubscription,
    handleCreateSubscription,
    handleCreateCustomer,
    handleUpdatePaymentMethod,
    handleWebhooks,
    initializeSubscriptionWithPlan,
    // handleUpdateUserSubscriptionStatus,
}

