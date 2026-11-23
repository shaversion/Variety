var TinyJS = function(element) {
  this.element = element;
}

var _ = function(element) {
  return new TinyJS(element);
};

TinyJS.prototype = {
  activateSelector: function(values) {
    this.hide();

    var parent = this.parent();
    var buttons = [];
    var currentIndex = 0;

    for(var value in values) {
      var title = values[value];

      var button = _(document.createElement('input'));

      button.hide();

      button.attribute('type', 'button');
      button.attribute('value', title);

      (function(button, value, input) {
        button.click(function() {
          button.hide();
          currentIndex++;
          if (currentIndex == buttons.length)
            currentIndex = 0;
          buttons[currentIndex].show();
          input.value(value);
        });
      })(button, value, this);

      parent.append(button);
      buttons.push(button);

      this[value] = function() {
        if (this.value() == value)
          return true;
        else
          return false;
      }
    }
    buttons[currentIndex].show();
  },

  activateMenu: function(menu) {
    this.element.addEventListener('contextmenu', function(e) {
      if (!e.altKey) e.preventDefault();
      if (e.ctrlKey) {
        menu.show();
        menu.style('position', 'absolute');
        menu.style('left', e.pageX + 'px');
        menu.style('top', e.pageY + 'px');
      }
    }, false);

    document.addEventListener('click', function() {
      menu.hide();
    }, false);
  },

  toggle: function() {
    if (this.element.style.display != "none") 
      this.element.hide();
    else 
      this.element.show();
  },

  hide: function() {
    this.element.style.display = "none";
  },

  show: function() {
    this.element.style.display = "inline";
  },

  parent: function() {
    return _(this.element.parentElement);
  },

  children: function() {
    var children = this.element.children;
    var results = [];
    for(var i = 0; i < children.length; i++)
      results.push(_(children[i]));
    return results;
  },

  value: function(value) {
    if (arguments.length == 1)
      this.element.value = value;
    return this.element.value;
  },

  click: function(callback) {
    this.element.onclick = callback;
  },

  append: function(child) {
    this.element.appendChild(child.element);
  },

  html: function(html) {
    if (arguments.length == 1)
      this.element.innerHTML = html;
    return this.element.innerHTML;
  },

  attribute: function(key, value) {
    if (arguments.length == 2)
      this.element.setAttribute(key, value);
    return this.element.attributes[key];
  },

  style: function(key, value) {
    if (arguments.length == 2)
      this.element.style[key] = value;
    return this.element.style[key];
  },

  makeVisualizerMenu: function(menu, actions) {
    var items = menu.children();
    for(var i = 0; i < items.length; i++) {
      (function(index) {
        items[index].click(actions[index]);
      })(i);
    }
    this.activateMenu(menu);
  },

  makeVisualizerActions: function(parameters) {
    var actions = [];
    var context = this.element;
    for(var i = 0; i < parameters.classes.length; i++) {
      (function(index) {
        actions.push(function() {
          try {
            //TODO move to ThreeVP3
            //var testOptions = parameters.visualizer.project();
            //var testVisualizer = new parameters.classes[index](testOptions);
            //testVisualizer.kill();
            parameters.visualizer.mutate(parameters.classes[index]);
          }
          catch(exception) {
            alert(exception);
          }
        });
      })(i);
    }
    actions.push(function(){
      var canvas = context.children[0];
      var src = canvas.toDataURL(); 
      var w = window.open('about:blank','','height='+canvas.height+',width='+canvas.width+','+'menubar=no,toolbar=no,status=no,directories=no,location=no');
      w.document.write("<html><head><title>Variety Virtual Machine image</title><style type='text/css'>body {size: auto;margin: 1;}</style></head><body><img src=" + src + "></img></body></html>");
    });
    return actions;
  }
}

//TODO move to tiny js

function initMenus(set,classes) {
  for (var i in set) {
    var o = (_(set[i][0]));
    o.makeVisualizerMenu(_(set[i][1]), o.makeVisualizerActions({visualizer: set[i][2], classes: classes}));
  }
}
