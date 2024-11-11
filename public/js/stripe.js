/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
// const stripe = Stripe('pk_test_51QJaghBeVFOMWJTdbdunGcBQUNeo519BgjN2jQ5JQ9yeuanbV9kxvJo92kvvhMZJ0ALoXbM4xXgHWj2uyiYrYLSf00YsJzCRaZ');

export const bookTour = async tourId => {

  console.log(tourId)
  // try {
  //   // 1) Get checkout session from API
  //   const session = await axios(
  //     `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
  //   );
  //   console.log(session);

  //   // 2) Create checkout form + chanre credit card
  //   await stripe.redirectToCheckout({
  //     sessionId: session.data.session.id
  //   });
  // } catch (err) {
  //   console.log(err);
  //   showAlert('error', err);
  // }
};