import firebase from "../init";

const login = async () => {
  console.log("login");
  var provider = new firebase.auth.GoogleAuthProvider();
  const result = await firebase.auth().signInWithPopup(provider);
  var credential = result.credential;
  var token = credential.accessToken;
  var user = result.user;
  console.log({ token, user });
};

export default { login };
