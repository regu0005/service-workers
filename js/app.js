const APP = {
  isOnline: 'onLine' in navigator && navigator.onLine,
  init() {
    APP.registerWorker();
    APP.addListeners();
    APP.getTopScores();
  },
  addListeners() {
    // Display a CURRENTLY OFFLINE message in the header span if the page is loaded offline
    const offlineContent = document.querySelector('.offline');
    const currentTitle = document.title;

    // Listen for the online and offline events and update the message in the header span
    window.addEventListener('offline',(ev)=>{
        offlineContent.innerHTML = "Offline";
        document.title = "Offline " + currentTitle;
    });
    window.addEventListener('online',(ev)=>{
          offlineContent.innerHTML = "";
          document.title = currentTitle;
    });

    if(!APP.isOnline)
    {
      offlineContent.innerHTML = "Offline";
      document.title = "Offline " + currentTitle;
    }
  },
  getTopScores() {
    let url = 'https://jsonplaceholder.typicode.com/users';
    fetch(url, {
      method: 'get',
      headers: { accept: 'application/json,text/json' },
    })
      .then((resp) => {
        if (!resp.ok) throw new Error(resp.statusText);
        return resp.json();
      })
      .then((users) => {
        //add scores to each person
        let scores = users
          .map((user) => {
            let score = Math.floor(Math.random() * 100000) + 100000;
            //only keep the name and id properties plus a random high score
            return { name: user.name, id: user.id, score };
          })
          .sort((a, b) => {
            return a.score - b.score;
          });

        const list = document.getElementById('scorelist');
        
        //List of items inside scorelist with name and score plus a data- prop for the id
        counter = 1;
        scores.map((user) => {
          let id = user.id;
          let name = user.name;
          let score = user.score;
  
          let item = document.createElement('li');
          item.innerHTML = `${counter}: Name: ${name} - ID: ${id} - Score: ${score}`;

          list.appendChild(item);
          counter++;
        });

      })
      .catch(APP.handleError);
  },
  registerWorker() {
    //Check if serviceworkers are supported
    if ('serviceWorker' in navigator) {
      // Supported! then Register the sw.js file
      navigator.serviceWorker.register('sw.js');
    }
  },
  handleError(err) {
    // Output fetch errors to the page when the external JSON is not working, and is not cached
      const emptyUser = {"id": 0, "name": "not available", "score": "not available"};
      const list = document.getElementById('scorelist');
      let id = emptyUser.id;
      let name = emptyUser.name;
      let score = emptyUser.score;
      let item = document.createElement('li');
      item.innerHTML = `Name: ${name} - ID: ${id} - Score: ${score}`;
      list.appendChild(item);
  },
};

document.addEventListener('DOMContentLoaded', APP.init);
