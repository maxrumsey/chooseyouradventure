var Game;
document.addEventListener('DOMContentLoaded', () => {
  Game = new AdventureGame(axios, () => {
    console.debug('Game Ready');
    Game.startGame();
  })
  document.getElementById('restart-button').addEventListener('click', function() {
    Game = new AdventureGame(axios, () => {
      console.debug('Game Ready');
      Game.startGame();
    })
  })
})

class AdventureGame {
  /*
   * Class Constructor
   */
  constructor(axios, ready) {
    // Ensures axios exists. And then sets it.
    if (!axios) throw new Error('Axios not Found.');
    this.axios = axios;
    // Inits content cache.
    this.contents = {};
    /*
     * Loads pages directory.
     */
    axios.get('game/pages.json')
      .then(pages => {
        console.log(pages.data)
        if (typeof pages.data == 'string') {
          try {
            this.pages = JSON.parse(pages.data)
          } catch (e) {
            throw e;
          }
        } else {
          this.pages = pages.data;
        }
        console.log(this)
        if (pages.status !== 200) throw new Error('Request Error');
        ready();
      })
      .catch(e => {
        throw e;
      })
    /*
     * Other initialisations.
     */
    document.getElementById('player-next').onclick = () => {
      this.nextScene();
    }
    document.getElementById('player-opt1').onclick =  () => {
      this.optionButton(1);
    }
    document.getElementById('player-opt2').onclick =  () => {
      this.optionButton(2);
    }
    document.getElementById('player-opt3').onclick =  () => {
      this.optionButton(3);
    }
    document.getElementById('player-opt4').onclick =  () => {
      this.optionButton(4);
    }
  }
  /*
   * Makes a Request
   */
  makeRequest(url, type, data) {
    return axios[type](url, data);
  }
  /*
   * Start game function.
   */
  startGame() {
    this.hideAllButtons();
    this.hideNext();
    this.hideImage();
    // Gets location of page content.
    let file = this.pages.start.content.split('/')[0];
    let suffix = this.pages.start.content.split('/')[1];
    // Pulls content file.
    this.makeRequest(`game/content/${file}.json`, 'get')
      .then(content => {
        // Adds file to content cache.
        this.contents[file] = content.data;
        // Sets page.
        this.page = this.pages.start;
        this.loadScene({ contentFile: file, contentSuffix: suffix })
      })
      .catch(e => {
        console.error(e);
      })
  }
  nextScene() {
    this.hideNext();
    this.hideAllButtons();
    this.hideImage();
    this.setScene(this.page.next);
  }
  /*
   * Puts the content onto the screen.
   */
  async loadScene({ contentFile, contentSuffix }) {
    if (!this.contents[contentFile][contentSuffix]) {
      let content = await this.makeRequest(`game/content/${contentFile}.json`, 'get');
      this.contents[contentFile] = content;
    }
    if (this.contents[contentFile][contentSuffix].content) {
      document.getElementById('player-textbox').innerHTML = this.contents[contentFile][contentSuffix].content;
    }
    if (this.contents[contentFile][contentSuffix].image) {
      this.setImage(this.contents[contentFile][contentSuffix].image);
    }
    if (this.page.next) {
      document.getElementById('player-next').style.display = 'inline';
      document.getElementById('player-next').innerHTML = this.contents[contentFile][contentSuffix].nextButtonContent || 'Next';
    }
    if (this.page.options) {
      this.displayOptions(this.page.content.split('/')[0], this.page.content.split('/')[1]);
    }
  }
  /*
   * Handles the complete setting of the scene
   */
  setScene(pageName) {
    if (!this.pages.pages[pageName]) throw new Error(pageName + ' not found.');
    this.page = this.pages.pages[pageName]
    this.loadScene({
      contentFile: this.page.content.split('/')[0],
      contentSuffix: this.page.content.split('/')[1]
    })
    if (this.page.options) this.displayOptions(this.page.content.split('/')[0], this.page.content.split('/')[1]);
  }
  hideAllButtons() {
    document.getElementById('player-opt1').style.display = 'none';
    document.getElementById('player-opt2').style.display = 'none';
    document.getElementById('player-opt3').style.display = 'none';
    document.getElementById('player-opt4').style.display = 'none';
  }
  hideNext() {
    document.getElementById('player-next').style.display = 'none';
  }
  optionButton(n) {
    this.hideNext();
    this.hideAllButtons();
    this.hideImage();
    this.setScene(this.page.options[n-1]);
  }
  displayOptions(contentFile, contentSuffix) {
    let content = [];
    if (this.page.options) {
      if (!this.contents[contentFile][contentSuffix].options) return;
      for (var i = 0; i < this.page.options.length; i++) {
        content.push(this.contents[contentFile][contentSuffix].options[i]);
        document.getElementById(`player-opt${(i+1)}`).style.display = 'inline';
      }
    }
    document.getElementById('player-opt1').innerHTML = content[0] || '';
    document.getElementById('player-opt2').innerHTML = content[1] || '';
    document.getElementById('player-opt3').innerHTML = content[2] || '';
    document.getElementById('player-opt4').innerHTML = content[3] || '';
  }
  hideImage() {
    document.getElementById('main-image').style.display = 'none';
  }
  setImage(href) {
    document.getElementById('main-image').src = href;
    document.getElementById('main-image').style.display = 'inline-block';
  }
}
