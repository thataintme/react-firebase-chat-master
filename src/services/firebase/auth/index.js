import phone from "./phone";
import google from "./google";
import firebase from "../init";

const signOut = (callback = console.log, errorHandler = console.error) => {
  firebase.auth().signOut().then(callback).catch(errorHandler);
};

const auth = { phone, google, signOut };

export default auth;
