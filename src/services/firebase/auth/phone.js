import firebase from "../init";

const setUpRecaptcha = () => {
  window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
    "recaptcha-container",
    {
      size: "invisible",
      callback: (response) => {
        console.log(response);
      },
    }
  );
};

const signIn = (phoneNumber, setConfirmationResult) => {
  console.log("click");
  setUpRecaptcha();
  const appVerifier = window.recaptchaVerifier;
  firebase
    .auth()
    .signInWithPhoneNumber(phoneNumber, appVerifier)
    .then((confirmationResult) => {
      window.confirmationResult = confirmationResult;
      console.log(confirmationResult);
      setConfirmationResult(confirmationResult);
      return;
      const code = window.prompt("Enter OTP");
      confirmationResult
        .confirm(code)
        .then((result) => {
          const userdata = result.user;
          console.log(userdata);
        })
        .catch((error) => {
          console.error(error);
          alert("OTP wrong");
        });
    })
    .catch((error) => {
      console.error(error);
      alert("SMS not sent");
    });
};

export { signIn };

const sendOTP = (OTP, confirmationResult) => {
  if (!confirmationResult) return;
  console.log("kkk");
  confirmationResult
    .confirm(OTP)
    .then((result) => {
      const userdata = result.user;
      console.log(userdata);
    })
    .catch((error) => {
      console.error(error);
      alert("OTP wrong");
    });
};

export { sendOTP };

const phone = { signIn, sendOTP };
export default phone;
