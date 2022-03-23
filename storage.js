(() => {
  let storelm = document.createElement('iframe')
  storelm.src = "https://nulllikesnothing.github.io/storage.html"
  storelm.onload = () => {
    window.stor = storelm.contentWindow
  }
})();
void 0;
