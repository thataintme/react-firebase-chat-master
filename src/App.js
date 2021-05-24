import React, { useEffect, useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';

import {BrowserRouter, Switch, Route, useParams, Link, Redirect} from 'react-router-dom';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import useLocalStorage from './hooks/useLocaStorage';

import NodeRSA from 'node-rsa';
var key = null;

var encKey = null;
var selectedClient = null;

firebase.initializeApp({
  apiKey: "AIzaSyDlZ3lau-4mVu9upxehozUC7bNIs83GNmI",
  authDomain: "acschat-ea681.firebaseapp.com",
  projectId: "acschat-ea681",
  storageBucket: "acschat-ea681.appspot.com",
  messagingSenderId: "544409209642",
  appId: "1:544409209642:web:6214a15348169c9956ac53",
  measurementId: "G-51WN41WWXZ"
})

const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();


function App() {

  const [user] = useAuthState(auth);
  

  return (
    <div className="App">
      <header>
        <h1>Admin chat page💬</h1>
        <SignOut />
      </header>

      <section>
        {user ? <BrowserRouter>
                  <Switch>
                    <Route path='/:dbname'>
                      <ChatRoom />
                    </Route>

                    <Route path='/'>
                      <RoomSelect />
                    </Route>
                  </Switch>
                </BrowserRouter>
                : <SignIn />}
      </section>

    </div>
  );
}

function SignIn() {


  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
      <p>Click here to generate key</p>
      
    </>
  )
}



function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function RoomSelect() {
  const usersRef = firestore.collection("_users");
  const query = usersRef;
  const [users] = useCollectionData(query, { idField: 'email' });
  const [statuses] = useCollectionData(query, { idField: 'status' });
  console.log(users)

  const [KEY, setKEY] = useLocalStorage("AdminPrivateKEY")
  const [strKEY, setStrKey] = useLocalStorage("StrAdminPrivateKey")
  useEffect(() => {
    if(!KEY)
    {
      key = new NodeRSA({b:512});
      //await //------------send public key to firebase------------
      setKEY(key.exportKey('pkcs1-private-der'));
      console.log('Here we set the private key in binary. now saving string');
      setStrKey(key.exportKey('pkcs1-private-der').toString('base64'));
    }
    // USE THE KEY HERE
    console.log(KEY);
  }, [KEY])

  const [room,setRoom] = useState("");
  return (
  <div>
    {users?.map((item) => (
      <Link to={item.email} >
      <div className="emailList">
        <img src={item.photoURL} />
        {item.email}
      </div>
      </Link>
    ))}

  </div>
  )
  //<img src={item.status} />
}


function ChatRoom() {
  const dummy = useRef();

  const {dbname} = useParams();
  const messagesRef = firestore.collection(dbname);
  const query = messagesRef.orderBy('createdAt');
  const [messages] = useCollectionData(query, { idField: 'id' });
  const [formValue, setFormValue] = useState('');
  
  const [clientDetails, setClientDetails] = useState('')

  const [KEY, setKEY] = useLocalStorage("AdminPrivateKEY")
  const [strKEY, setStrKey] = useLocalStorage("StrAdminPrivateKey")
  useEffect(() => {
    if(!KEY)
    {
      key = new NodeRSA({b:512});
      //await //------------send public key to firebase------------
      setKEY(key.exportKey('pkcs1-private-der'));
      console.log('Here we set the private key in binary. now saving string');
      setStrKey(key.exportKey('pkcs1-private-der').toString('base64'));
    }
    // USE THE KEY HERE
    console.log(KEY);
  }, [KEY])



  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;

    //--------------------------------Get the client's public key and encrypt (myCopy)------------------
    var clientKey = '';
    await firestore.collection('_users').doc(dbname).get().then(function(doc) {
      clientKey = doc.data().PublicKeyRSA;
      console.log("Client's KEY ",clientKey);
    });
    
    //-------------------------------encrypt for self (text)--------------------------------------------
    var adminPublicKey = '';
    await firestore.collection('Admin').doc('AdminPublicKey').get().then(function(doc) {
      console.log("Admin's KEY ",doc.data().PublicKey);
      adminPublicKey = doc.data().PublicKey;
    });
    
    var cliEncKey = new NodeRSA(clientKey,'pkcs1-public');
    var ClientsEncryptedMessage = cliEncKey.encrypt(formValue,'base64')
    var adminEncKey = new NodeRSA(adminPublicKey,'pkcs1-public');
    var AdminsEncryptedMessage = adminEncKey.encrypt(formValue,'base64');

    await messagesRef.add({
      uname: auth.currentUser.displayName,
      text: AdminsEncryptedMessage, //text is admin's copy, formvalue is value typed
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      myCopy: ClientsEncryptedMessage, //mycopy is clients copy
      uid,
      photoURL
    })
    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (<>
    <main>

      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={dummy}></span>

    </main>

    <form onSubmit={sendMessage}>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Type message here" />

      <button type="submit" disabled={!formValue}>➤ Send</button>

    </form>
  </>)
}


function ChatMessage(props) {
  const { uname, text, uid, photoURL,myCopy } = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  //------------------------------------DECRYPTING HERE--------------------------------------

  const [strKEY, setStrKEY] = useLocalStorage("StrAdminPrivateKey")
  useEffect(() => {
    if(!strKEY)
    {
      key = new NodeRSA({b:512});
      //await //------------send public key to firebase------------
      setStrKEY(key.exportKey('private'));
    }
    // USE THE KEY HERE
    console.log("decryption code reached: ",strKEY);
  }, [strKEY])

  //console.log("admin's private key here is")
  //console.log(strKEY);
  var decryptor = new NodeRSA(strKEY,'private')
  const DecryptedMessage = decryptor.decrypt(text, 'utf8')

  //betweek p's text is for admin's copy. myCopy is for client's copy
  return (<>

    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://photos.app.goo.gl/mJHTe74MuLibh4Po6'} />
        <div className={'usernamedisplay'}>
          <p className={'unam'}>{uname}</p>
          <p>{DecryptedMessage}</p>
        </div>
    </div>
  </>)
}


export default App;
