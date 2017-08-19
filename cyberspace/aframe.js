AFRAME.registerComponent('scale-on-hover', {
  init: function () {
    var el = this.el;
    el.addEventListener('mouseenter', function () {
      el.setAttribute('scale', { x: 1.1, y: 1.1, z: 1.1 });

    });
    el.addEventListener('mouseleave', function () {
      el.setAttribute('scale', { x: 1, y: 1, z: 1 });
    });
  }
});

AFRAME.registerComponent('move-on-click', {
  init: function () {

    var el = this.el;
    var camera = document.getElementById("camera");

    el.addEventListener('click', function () {

      var cPos = camera.getAttribute('position');
      var elPos = el.getAttribute('position');

      animate(function(progress){
        var currentPos = {
          x: cPos.x + ((elPos.x - cPos.x) * progress),
          y: cPos.y,
          z: cPos.z + ((elPos.z - cPos.z) * progress),
        }
        camera.setAttribute('position', currentPos );
      }, 1000)

    });
  }
});

function animate(draw, duration) {
  let start = performance.now();

  requestAnimationFrame(function animate(time) {
    // timeFraction goes from 0 to 1
    let timeFraction = (time - start) / duration;
    if (timeFraction > 1) timeFraction = 1;

    // calculate the current animation state
    let progress = timeFraction

    draw(progress); // draw it

    if (timeFraction < 1) {
      requestAnimationFrame(animate);
    }
  });
}
function getBox(pos) {
  var box = document.createElement('a-box');
  box.setAttribute('src','#grid');
  box.setAttribute('position', pos.x + " " + pos.y + " " + pos.z);
  box.setAttribute('color', "#4CC3D9");
  box.setAttribute('height', "4");
  box.setAttribute('width', "4");
  box.setAttribute('depth', "4");

  return box;
}

function getNode(pos, color) {
  var node = document.createElement('a-entity');

  var box = document.createElement('a-box');

  box.setAttribute('position', pos.x + " " + pos.y + " " + pos.z);
  box.setAttribute('color', color);
  box.setAttribute('height', "1.5");
  box.setAttribute('width', "1.5");
  box.setAttribute('depth', "1.5");
  box.setAttribute('rotation', "0 45 0");
  box.setAttribute('move-on-click', '');
  box.setAttribute('scale-on-hover', '');
  node.appendChild(box);


  var frame = document.createElement('a-plane');
  frame.setAttribute('position', (pos.x) + " " + (pos.y-0.7) + " " + (pos.z));
  frame.setAttribute('color', color);
  frame.setAttribute('rotation', "-90 45 0");
  frame.setAttribute('material', 'transparent:true')
  frame.setAttribute('src', "#frame");
  frame.setAttribute('height', "1.4");
  frame.setAttribute('width', "1.4");
  node.appendChild(frame);

  var terminal = document.createElement('a-plane');
  terminal.setAttribute('position', (pos.x - 0.5) + " " + (pos.y - 0.4) + " " + (pos.z - 0.5));
  terminal.setAttribute('color', color);
  terminal.setAttribute('height', "0.5");
  terminal.setAttribute('width', "0.5");
  terminal.setAttribute('rotation', "-10 45 0");
  node.appendChild(terminal);

  var text = document.createElement('a-text');
  text.setAttribute('position', (pos.x - 0.5) + " " + (pos.y - 0.35) + " " + (pos.z - 0.5));
  text.setAttribute('color', "#FFF");
  text.setAttribute('height', "0.45");
  text.setAttribute('width', "0.45");
  text.setAttribute('align', "left");
  text.setAttribute('anchor', "center");
  text.setAttribute('wrap-count', "10");
  text.setAttribute('font', "sourcecodepro");
  text.setAttribute('rotation', "-10 45 0");
  text.setAttribute('value', "code\n0x475AF\n\n>hack")
  node.appendChild(text);

  return node;
}

AFRAME.registerComponent('cyberspace', {
  init: function () {
    var scene = this.el;

    for (var i = 0; i <= 16; i++) {
      for (var j = 0; j <= 16; j++) {
        var pos = {
          x: (i * 4),
          y: 2,
          z: (j * 4),
        }

        if (i === 0 || i == 16 ||
            j == 0 || j == 16 ||
            ((i % 2 === 0) && (j % 2 === 0)) ||
            ((((i % 2 === 0) && (j % 2 === 1)) || ((i % 2 === 1) && (j % 2 === 0))) && Math.random() < 0.25)
        ) {
          scene.appendChild(getBox(pos));
        }

        if ((i % 2 === 1) && (j % 2 === 1)) {
          pos.y = 1.7;
          var color = ['#3E5', '#3CF', '#FF3', '#F3C'][~~(Math.random() * 4)];
          scene.appendChild(getNode(pos, color))
        }
      }
    }

    var camera = document.getElementById('camera');
    camera.setAttribute('position', {
      x: ~~(Math.random() * 8) * 8 + 4,
      y: 0,
      z: ~~(Math.random() * 8) * 8 + 4,
    })
  }
});
