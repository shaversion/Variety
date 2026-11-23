//  Copyright 2020 Valerian Ivashenko
//
//  This program is free software: you can redistribute it and/or modify
//  it under the terms of the GNU Lesser General Public License as published by
//  the Free Software Foundation, either version 2 of the License, or
//  (at your option) any later version.
//
//  This program is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
//  GNU Lesser General Public License for more details.
//
//  You should have received a copy of the GNU Lesser General Public License
//  along with this program.  If not, see <https://www.gnu.org/licenses/>.

function Presenter(options) {
  var self = this;
  this.virtual_machine = options.virtual_machine;
  this.memory_values = options.memory_values;
  this.from_address = options.from_address;
  this.to_address = options.to_address;
  this.from_register = options.from_register;
  this.to_register = options.to_register;
  this.registers_values = options.registers_values;
  this.memory = options.memory;
  this.registers = options.registers;
  this.memory_history = options.memory_history;
  this.registers_history = options.registers_history;
//  this.variety = options.variety;
//  this.gradientor = options.gradientor;
//  this.memoryVisualizer = options.memoryVisualizer;
//  this.memoryHistoryVisualizer = options.memoryHistoryVisualizer;
//  this.registersVisualizer = options.registersVisualizer;
//  this.registersHistoryVisualizer = options.registersHistoryVisualizer;
//  this.statsVisulaizer = options.statsVisualizer;
  this.stats = options.stats;
//  this.animator = options.animator;
//  this.process = options.process;
  this.processorID = options.processorID;
  this.p = options.p;
  this.f = options.f;
  this.e = options.e;
  this.g = options.g;
//  this.general = options.viewport;
//  this.menu = options.keyboard_input;
//  this.input_field = options.input_field;

  this.document = options.document;

  this.about = options.about;
  this.show = options.show;
  this.show_control_label = options.show_control_label;
  this.show_control = options.show_control;
  this.show_memory = options.show_memory;
  this.show_registers = options.show_registers;
  this.show_history = options.show_history;
  this.update_limit = options.update_limit;
  this.update_history = options.update_history;
  this.hardware_update = options.hardware_update;
  this.software_update = options.software_update;
  this._pause = options.pause;
  this._resume = options.resume;
  this.repeat = options.repeat;
  this.submit = options.submit;
  this.swap = options.swap;
  this.remove = options.remove;
  this._constructor = options.constructor;
  this.instruction = options.instruction;
  this.operations = options.operations;
  this.operation = options.operation;
  this.operation_name = options.operation_name;
  this.operation_swap = options.operation_swap;
  this.save = options.save;
  this.load = options.load;
  this.save_memory = options.save_memory;
  this.load_memory = options.load_memory;
  this.save_registers = options.save_registers;
  this.load_registers = options.load_registers;

  this.startcolor = options.startcolor;
  this.finalcolor = options.finalcolor;
  this.startpoint = options.startpoint;
  this.finalpoint = options.finalpoint;
  this.color = options.color;

  this.color.onclick = function(){self.addGradient();};
  this._resume.onclick = function(){self.resume();};
  this._pause.onclick = function(){self.pause();};
  this.update_limit.onkeyup = function(){if (self._pause.style.display=='') {self.pause(); self.resume();}};
  this.show_control.onchange = function(){self.toggle(self.show,this.checked);self.toggle(self.virtual_machine,this.checked);self.toggle(self.about,this.checked);self.toggleVisualizers();};
  this.show_memory.onchange = function(){self.toggle(self.memory, this.checked); if (self.show_history.checked && self.registers_history.style.display != 'none') self.toggle(self.memory_history, this.checked);self.toggleVisualizers();};
  this.show_registers.onchange = function(){self.toggle(self.registers, this.checked); if (self.show_history.checked && self.memory_history.style.display != 'none') self.toggle(self.registers_history, this.checked);self.toggleVisualizers();};
  this.show_history.onchange = function(){var sm=self.show_memory.checked; var sr=self.show_registers.checked; if (sm || !sr) self.toggle(self.memory_history, this.checked); if (sr || !sm) self.toggle(self.registers_history, this.checked);self.toggleVisualizers();};

  this._constructor.onclick = this.instruction.onclick = function(){self.toggle(self._constructor); self.toggle(self.instruction);};
  this.submit.onclick = function(){self.updateOperation();};
  this.swap.onclick = function(){self.swapOperation();};
  this.remove.onclick = function(){self.removeOperation();};
  this.save.onclick = function(){self.saveOperations();};
  this.load.onclick = function(){self.loadOperations();};
  this.save_memory.onclick = function(){self.saveMemoryState();};
  this.load_memory.onclick = function(){self.loadMemoryState(); self.updateVisualizers();};
  this.save_registers.onclick = function(){self.saveRegistersState();};
  this.load_registers.onclick = function(){self.loadRegistersState(); self.updateVisualizers();};

  this.pause = function() { this.toggle(this._resume,true); this.toggle(this._pause,false); this.variety.stop(); };
  this.resume = function() {
    this.pause(); this.toggle(this._resume,false); this.toggle(this._pause,true);
    this.variety.step(this.update_limit.value);
  };
  this.toggle = function(div, flag) {
    if (arguments.length == 1) {
      flag = (div.style.display == "none"); 
    }
    div.style.display = flag?"":"none";
  };
//  this.toggle = function(div, flag) {
//    if (arguments.length == 1) {
//      flag = (document.getElementById(div).style.display == "none"); 
//    }
//    document.getElementById(div).style.display = flag?"":"none";
//  };
  this.toggleVisualizers = function(f) {
    var f = this.show_control.checked;
    if (f && (this.memory.style.display != 'none')) this.animator.awake(this.memoryVisualizer); else this.animator.sleep(this.memoryVisualizer);
    if (f && (this.registers.style.display != 'none')) this.animator.awake(this.registersVisualizer); else this.animator.sleep(this.registersVisualizer)
    if (f && (this.memory_history.style.display != 'none')) this.animator.awake(this.memoryHistoryVisualizer); else this.animator.sleep(this.memoryHistoryVisualizer);
    if (f && (this.registers_history.style.display != 'none')) this.animator.awake(this.registersHistoryVisualizer); else this.animator.sleep(this.registersHistoryVisualizer);
  };
  this.addGradient = function() {
    var startColor = this.startcolor.value;
    var finalColor = this.finalcolor.value;
    var startPoint = parseInt(this.startpoint.value);
    var finalPoint = parseInt(this.finalpoint.value);
    if (startPoint > finalPoint) {
      var t = finalPoint; finalPoint = startPoint; startPoint = t;
      t = finalColor; finalColor = startColor; startColor = t;
    }
    this.gradientor.addGradient("#" + startColor, "#" + finalColor, startPoint, finalPoint);
    this.updateVisualizers();
  };
  this.loadMemoryState = function() {
    var stateString = this.memory_values.value;
    var state = stateString.split(/[ \n]+/g);
    var from_address = this.from_address.value;
    var to_address = this.to_address.value;
    if (!isNaN(from_address)) {
      from_address = parseInt(from_address);
      if (!isNaN(to_address)) if (parseInt(to_address) != from_address+state.length) alert("to address changed");
      this.to_address.value = to_address = from_address+state.length;
      this.variety.inject({state: {memory: state, from: from_address, to: to_address}});
    }
  };
  this.loadRegistersState = function() {
    var stateString = this.registers_values.value;
    var state = stateString.split(/[ \n]+/g);
    var from_register = this.from_register.value;
    var to_register = this.to_register.value;
    if (!isNaN(from_register)) {
      from_register = parseInt(from_register);
      if (!isNaN(to_register)) if (parseInt(to_register) != from_register+state.length) alert("to regiser changed");
      this.to_register.value = to_register = from_register+state.length;
      this.variety.getProcessor(this.processorID).inject({state: {registers: state, from: from_register, to: to_register}});
    }
  };
  this.loadOperations = function() {
    var self = this;
    self.pause();
    var json = self.operations.value;
    if (!json) return;
    try {
      var jsonObject = JSON.parse(json);
      jsonObject.callback = (function(f) {if (f===undefined) { if (self.hardware_update.checked) self.updateVisualizers(); } else if (self.software_update.checked) { self.updateVisualizers(); f = 0; }; if (!self.repeat.checked) self.pause(); return f; });
      self.variety = VirtualMachine.fromJSON(jsonObject);

      self.f = false;
      if (jsonObject.core) if (jsonObject.core.resume) self.f = true;
      self.toggle(self._pause,self.f);
      self.toggle(self._resume,!self.f);

      self.update_limit.value = self.variety.getQuant();
    } catch (e) {
       alert(e.message || e.description);
    }
  };
  this.removeOperation = function() {
    var name = this.operation_name.get(0).value;
    this.variety.getProcessor(this.processorID).removeOperation(name, this.operation);
    this.operation_name.get(0).value = "";
    this.operation.value = "";
  };
  this.saveOperations = function() {
    this.operations.value = formatJson(JSON.stringify(this.variety.project({state:{volume:{},ports:{}},core:{quant:{},processor:[{state:{volume:{}},core:{interface:{},implementation:{},constructors:{}}}]}})));
  };
  this.swapOperations = function() {
    var nameOne = this.operation_name.get(0).value;
    var nameTwo = this.operation_swap.get(0).value;
    this.variety.getProcessor(this.processorID).swapOperations(nameOne, nameTwo);
  };
  this.saveMemoryState = function() {
    var from_address = this.from_address.value;
    var to_address = this.to_address.value;
    if (!isNaN(from_address) && !isNaN(to_address)) {
      from_address = parseInt(from_address);
      to_address = parseInt(to_address);
      this.memory_values.value = (this.variety.project({state: {memory: {}, from: from_address, to: to_address}})).state.memory.join(" ");
    }
  };
  this.saveRegistersState = function() {
    var from_register = this.from_register.value;
    var to_register = this.to_register.value;
    if (!isNaN(from_register) && !isNaN(to_register)) {
      from_register = parseInt(from_register);
      to_register = parseInt(to_register);
      this.registers_values.value = (this.variety.getProcessor(this.processorID).project({state: {registers: {}, from: from_register, to: to_register}})).state.registers.join(" ");
    }
  };
  this.updateOperation = function() {
    var constructor = (this._constructor.style.display == "");
    this.variety.getProcessor(this.processorID).updateOperation(this.operation_name.get(0).value, this.operation.value, constructor);
  };
  this.updateVisualizers = function() {
    this.memoryVisualizer.update({ array: this.variety.getManager().memory });
    this.registersVisualizer.update({ array: this.variety.getProcessor(this.processorID).registers });
    if (this.update_history.checked) {
      this.memoryHistoryVisualizer.update({ array: this.variety.getManager().memory });
      this.registersHistoryVisualizer.update({ array: this.variety.getProcessor(this.processorID).registers });
    }
//    this.statsVisualizer.update({});
 }
  this.createCanvasVisualizers = function() {
    this.memoryVisualizer = new ThreeVP3.ThreeArrayVisualizer({container: this.memory, width: ThreeVP3.Visualizer.DEFAULT_WIDTH, gradientor: this.gradientor, rendererType: "canvas"});
    this.memoryHistoryVisualizer = new ThreeVP3.CanvasArrayHistoryVisualizer({container: this.memory_history, width: ThreeVP3.Visualizer.DEFAULT_WIDTH, gradientor: this.gradientor});
    this.registersVisualizer = new ThreeVP3.ThreeArrayVisualizer({container: this.registers, width: this.g.vr_volume, gradientor: this.gradientor, rendererType: "canvas"});
    this.registersHistoryVisualizer = new ThreeVP3.CanvasArrayHistoryVisualizer({container: this.registers_history, width: this.g.vr_volume, gradientor: this.gradientor});
    this.statsVisualizer = new ThreeVP3.StatsVisualizer({container: this.stats});
  };
  this.createWebGLVisualizers = function() {
    this.memoryVisualizer = new ThreeVP3.ThreeArrayVisualizer({container: this.memory, width: ThreeVP3.Visualizer.DEFAULT_WIDTH, gradientor: this.gradientor, rendererType: "webgl"});
    this.memoryHistoryVisualizer = new ThreeVP3.WebGLThreeArrayHistoryVisualizer({container: this.memory_history, width: ThreeVP3.Visualizer.DEFAULT_WIDTH, gradientor: this.gradientor});
    this.registersVisualizer = new ThreeVP3.ThreeArrayVisualizer({container: this.registers, width: this.g.vr_volume, gradientor: this.gradientor, rendererType: "webgl"});
    this.registersHistoryVisualizer = new ThreeVP3.WebGLThreeArrayHistoryVisualizer({container: this.registers_history, width: this.g.vr_volume, gradientor: this.gradientor});
    this.statsVisualizer = new ThreeVP3.StatsVisualizer({container: this.stats});
  };
  this.createVisualizers = function() {
    if (ThreeVP3.Utils.WebGLDetector()) 
      this.createWebGLVisualizers();
    else
      this.createCanvasVisualizers();
    this.updateVisualizers();
    var v = [this.memoryVisualizer,this.memoryHistoryVisualizer,this.registersVisualizer,this.registersHistoryVisualizer];
    if (this.stats.style.display != 'none') v.push(this.statsVisualizer);
    this.animator = new ThreeVP3.Animator({animes: v});
    this.animator.animate();
    this.toggleVisualizers();
  };
  return this;
}

function init(v,f) {
  var self = this;
  self.g = v;
  if (self.f) self.p = {state: {volume: 1000},core: {quant: 6000, processor: [{state: {volume: 64}}]}};
  self.p.callback = function(f) { if (f===undefined) { if (self.hardware_update.checked) self.updateVisualizers(); } else if (self.software_update.checked) { self.updateVisualizers(); f = 0; }; if (!self.repeat.checked) presenter.pause(); return f; };
  self.variety = new VirtualMachine(self.p);
  if (self.g.volume == undefined) self.g.volume = self.variety.getManager().VOLUME;
  if (self.g.vr_volume == undefined) self.g.vr_volume = self.variety.getProcessor(self.processorID).VOLUME;

  self.gradientor = new ThreeVP3.Utils.Gradientor({colors: self.g.colors, values: self.g.values});
  self.createVisualizers();
  
  var autocompleteCallback = function( name ) {
      var s = self.variety.getProcessor(self.processorID).getOperation(name);
      if (s !== undefined) self.operation.value = VirtualMachine.Processor.getOperationBody(s).toString();
      self._constructor.style.display = self.variety.getProcessor(self.processorID).isConstructor(name)?"":"none";
      self.instruction.style.display = self.variety.getProcessor(self.processorID).isConstructor(name)?"none":"";
    },
    autocompleteSource = function(request, response) {
      var _interface = self.variety.getProcessor(self.processorID).getInterface();
      var results = [];
      for(var i = 0; i < _interface.length; i++) {
        if (_interface[i].substr(0, request.term.length) == request.term) 
          results.push(_interface[i]);
      }
      response(results);
    };
  
  self.operation_name.autocomplete({
    source: autocompleteSource,
    minLength: 0,
    change: function(event, ui) { autocompleteCallback(self.operation_name.get(0).value); },
    select: function(event, ui) { autocompleteCallback(ui.item.value); }
  });
  self.operation_swap.autocomplete({
    source: autocompleteSource,
    minLength: 0
  });

  self.repeat.checked = true;
  self._constructor.style.display = "none";
  
  self.f = false;
  if (self.p.core) if (self.p.core.resume) self.f = true;
  self.toggle(self._pause,self.f);
  self.toggle(self._resume,!self.f);


  self.screen = self.document.documentElement;
  self.document = self.screen.msRequestFullscreen? self.document: self.screen;

  if (self.g.fullscreen) {
    var screenchange = self.screen.requestFullscreen? 'fullscreenchange': self.screen.webkitRequestFullscreen? 'webkitfullscreenchange': self.screen.msRequestFullscreen? 'MSFullscreenChange': self.screen.mozRequestFullscreen? 'mozfullscreenchange': undefined;
    var screenerror = self.screen.requestFullscreen? 'fullscreenerror': self.screen.webkitRequestFullscreen? 'webkitfullscreenerror': self.screen.msRequestFullscreen? 'MSFullscreenError': self.screen.mozRequestFullscreen? 'mozfullscreenerror': undefined;
    var element = self.screen;
    //console.log(screenchange);
    //console.log(screenerror);
    //if (self.screen.msFullscreenElement !== undefined) console.log('!!!');
    var gtypes = {pointerdown:true,pointerover:true,touchstart:true,mouseenter:true,mouseover:true,mousedown:true,auxclick:true,keypress:true,keydown:true,click:true};
    var fse = (function(e) {/*console.log('@'+e.type);*/ return true;}), fsc;
    var rfs = function (e) {
      //console.log(e.type);
      if ((!self.screen.fullscreenElement || (self.screen.fullscreenElement === null)) &&
         (!self.document.msFullscreenElement || (self.document.msFullscreenElement === null)) &&
         (!self.screen.webkitFullscreenElement || (self.screen.webkitFullscreenElement === null)) &&
         (!self.screen.mozFullScreenElement || (self.screen.mozFullScreenElement === null)) /*&& e.isTrusted*/) {
        //console.log('+'+e.type+' '+e.isTrusted); 
        if (self.screen.requestFullscreen) self.screen.requestFullscreen();
        else if (self.screen.webkitRequestFullscreen) self.screen.webkitRequestFullscreen(); /* Safari */
        else if (self.screen.msRequestFullscreen) {
               if (e.type in {keypress:true,keydown:true,keyup:true}) {
                 if ("ActiveXObject" in window) {
                    var wscript = new ActiveXObject("WScript.Shell");
                    if (wscript !== null) setTimeout((function(){wscript.SendKeys("{F11}"); fsc(e); return;}),0);
                 }
               }
               else self.screen.msRequestFullscreen(); /* IE11 */
        }
        else if (self.screen.mozRequestFullScreen) self.screen.mozRequestFullScreen(); 
      }
      //else console.log('-'+e.type); 
      if (self.screen.fullscreenElement || self.screen.webkitFullscreenElement || self.document.msFullscreenElement || self.screen.mozFullScreenElement) fsc(e);
      return true;
    }
    if (screenchange !== screenerror) {
      for (var i in gtypes) element.addEventListener(i,rfs,true);
      self.document.addEventListener(screenerror,fse,false);
      self.document.addEventListener(screenchange,(fsc = function(e) {
        //console.log('!'+e.type); 
        for (var i in gtypes) element.removeEventListener(i,rfs,true);
        self.document.removeEventListener(screenerror,fse,false);
        self.document.removeEventListener(screenchange,fsc,false);}),false);
    }
  }

  self.f = true;
  if (self.g.control !== undefined) {
    self.f = false;
    if (self.g.control == false) self.toggle(self.show_control_label,self.f);
  }
  self.show_control.checked = self.f;
  self.toggle(self.about,self.f);
  self.toggle(self.show,self.f);
  self.toggle(self.virtual_machine,self.f);

  self.f = true;
  if (self.g.stats !== undefined) if (self.g.stats == false) self.f = false;
  self.toggle(self.stats,self.f);

  self.f = true;
  if (self.g.software !== undefined) if (self.g.software == false) self.f = false;
  self.software_update.checked = self.f;
  self.hardware_update.checked = self.g.hardware || false;

  self.f = true;
  if (self.g.memory !== undefined) if (self.g.memory == false) self.f = false;
  self.show_memory.checked = self.f;
  self.toggle(self.memory,self.f);
  var m = self.f;

  self.f = true;
  if (self.g.registers !== undefined) if (self.g.registers == false) self.f = false;
  self.show_registers.checked = self.f;
  self.toggle(self.registers,self.f);
  var r = self.f;

  self.f = self.g.history || false;
  self.show_history.checked = self.f;
  self.update_history.checked = self.f|m|r;
  self.toggle(self.registers_history,self.f&(!m|r));
  self.toggle(self.memory_history,self.f&(!r|m));

  self.update_limit.value = self.variety.getQuant();

  f();
  self.toggleVisualizers();
}
