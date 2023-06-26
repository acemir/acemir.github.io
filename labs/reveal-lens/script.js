document.querySelector('button').addEventListener('click', function(e) {
  navigator.mediaDevices.getUserMedia({
    audio: false, 
    video: {
      facingMode: 'environment'
    }
  }).then(stream => {
    // debugger;
    var video = document.querySelector('video');
    video.srcObject = stream;
    video.onloadedmetadata = function(e) {
      video.play();
    };
    document.documentElement.classList.add('streaming');
  }).catch(err => {
    console.log('error', err)
  });
});

document.querySelector('aside').addEventListener('touchstart', e => {
  e.preventDefault();
})

const options = Array.from(document.querySelectorAll('input[type=radio]'));

options.forEach(option => {
  option.addEventListener('click', e => {
    document.documentElement.style.setProperty('--hue', e.currentTarget.getAttribute('data-hue'))
    document.documentElement.classList.toggle('lens-white', e.currentTarget.id === 'white')
  })
})