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

firebase.initializeApp({
  apiKey: "AIzaSyA3hAImaUfe30ISl0z5PMxjw9SloKT8KTE",
  authDomain: "superchat-f279e.firebaseapp.com",
  projectId: "superchat-f279e",
  storageBucket: "superchat-f279e.appspot.com",
  messagingSenderId: "21649455285",
  appId: "1:21649455285:web:d0d4e68770137cc77226fc",
  measurementId: "G-C439PF8EQF"
})

const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();


function App() {

  const [user] = useAuthState(auth);
  

  return (
    <div className="App">
      <header>
        <h1>Chat with us💬</h1>
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


  const [room,setRoom] = useState("");
  return (
  <div>
    {users?.map((item) => (
      <Link to={item.email} >
      <div className="emailList">
        {item.email}
        {item.status}
      </div>
      </Link>
    ))}

  </div>
  )
}


function ChatRoom() {
  const dummy = useRef();

  const {dbname} = useParams();
  const messagesRef = firestore.collection(dbname);
  const query = messagesRef.orderBy('createdAt');
  const [messages] = useCollectionData(query, { idField: 'id' });
  const [formValue, setFormValue] = useState('');

  const [KEY, setKEY] = useLocalStorage("KEY")
  useEffect(() => {
    if(!KEY)
    {
      setKEY(Math.random());
    }
    // USE THE KEY HERE
    console.log(KEY);
  }, [KEY])


  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      uname: auth.currentUser.displayName,
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  if (dbname != auth.currentUser.email)
  {
    return <Redirect to={auth.currentUser.email} />
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
  const { uname, text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>

    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://photos.app.goo.gl/mJHTe74MuLibh4Po6'} />
        <div className={'usernamedisplay'}>
          <p className={'unam'}>{uname}</p>
          <p>{text}</p>
        </div>
    </div>
  </>)
}


export default App;
