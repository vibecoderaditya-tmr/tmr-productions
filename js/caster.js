var firebaseConfig = {
  apiKey: "AIzaSyB-KqHqavh4Cu6VJz16DkP-GOYlIjNLNcI",
  authDomain: "tmraditya-1ceb7.firebaseapp.com",
  databaseURL: "https://tmraditya-1ceb7-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tmraditya-1ceb7",
  storageBucket: "tmraditya-1ceb7.appspot.com",
  messagingSenderId: "852110646661",
  appId: "1:852110646661:web:09a4be17f81f60f387a2b9"
};

firebase.initializeApp(firebaseConfig);
var db = firebase.database();

document.getElementById("card-caster1").onclick = function() {
  window.location.href = "caster1.html";
};

document.getElementById("card-caster2").onclick = function() {
  window.location.href = "caster2.html";
};
