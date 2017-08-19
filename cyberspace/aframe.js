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

function createEntity(name, attrs) {
  const entity = document.createElement(name);

  for (const key in attrs) {
    let value = attrs[key];
    if (key === 'position') {
      value = value.x + " " + value.y + " " + value.z;
    }
    entity.setAttribute(key, value);
  }

  return entity;
}

function getBox(pos) {
  return createEntity('a-box', {
    src: '#grid',
    position: pos,
    color: '#fff',
    height: 4,
    width: 4,
    depth: 4
  });
}

function getNode(pos, color) {
  var node = document.createElement('a-entity');

  // node box
  node.appendChild(createEntity('a-box', {
    position: pos,
    color: color,
    height: 1.5,
    width: 1.5,
    depth: 1.5,
    rotation: '0 45 0',
    'move-on-click': '',
    'scale-on-hover': ''
  }));

  // node inside bottom frame
  node.appendChild(createEntity('a-plane', {
    position: { x: pos.x, y: pos.y - 0.7, z: pos.z },
    color: color,
    rotation: '-90 45 0',
    material: 'transparent:true',
    src: '#frame',
    height: 1.4,
    width: 1.4
  }));

  // node terminal
  node.appendChild(createEntity('a-plane', {
    position: { x: pos.x - 0.5, y: pos.y - 0.4, z: pos.z - 0.5 },
    color: color,
    rotation: '-10 45 0',
    height: 0.5,
    width: 0.5
  }));

  // node terminal text
  node.appendChild(createEntity('a-text', {
    position: { x: pos.x - 0.5, y: pos.y - 0.35, z: pos.z - 0.5 },
    color: '#fff',
    rotation: '-10 45 0',
    height: 0.45,
    width: 0.45,
    anchor: 'center',
    'wrap-count': 10,
    font: 'sourcecodepro',
    value: "code\n0x475AF\n\n>hack"
  }));

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
