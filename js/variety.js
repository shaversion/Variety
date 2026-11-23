var minor_pointer_limit = 0;
var major_pointer_limit = +4294967295;
var NonTypedArrayMemory = true;
function VirtualMachine(json) {
  // array hack
  if (!Array.isArray) { Array.isArray = function(arg) { return Object.prototype.toString.call(arg) === '[object Array]'; }; }

  this.manager = new VirtualMachine.MemoryManager();
  this.processor = [ new VirtualMachine.Processor({machine: this, core: {}}) ];
  //this.viewport = new VirtualMachine.Viewport();
  this.quant = 1;
  this.setQuant = function(q) { this.quant = q; }
  this.getQuant = function() { return this.quant; }
  this.bindStep = function() {
    var processor = this.processor;
    this.step = function(l) {
      l = this.interval = (l || this.interval);
      for(var i = 0; i < this.processor.length; i++) {
        this.processor[i].step(((l<this.quant)?l:this.quant),l,this.callback);
      }
    };
  }
  this.inject = function(json) {
    if (json) {
      if (this.session === undefined) this.session = 0;
      if (this.port === undefined) this.port = {"0":{}};
      this.out = json.out || function(port,value) { this.port[this.session][port] = value; return; };
      this.scan = json.scan || function(port) { var v = 0; for (s in this.port) if (this.port[s][port] != undefined) v = this.port[s][port]; return v; };
      if (json.state) {
        if (json.state.ports) {
          var p = json.state.ports;
          for (var x in p) {
            var port = p[this.session = x];
            for (var v in port) this.out(v,port[v]);
          }
        }
      }
      if (json.callback) this.callback = json.callback;
      if (json.core) {
        if (json.core.quant) this.quant = json.core.quant;
        if (json.core.constructors) this.constructors = json.core.constructors;
        if (json.core.processor) for (var i = 0; i < json.core.processor.length; i++) this.processor[i].inject(json.core.processor[i]);
//        if (json.core.processor) {
//          for (var i = 0; i < json.core.processor.length; i++) {
//            this.processor[i].construct();
//            this.processor[i].bindImplementation();
//            this.processor[i].bindStep();
//          }
//        }
//        this.construct();
//        this.bindStep();
      }
      if (json.state) {
        if (json.state.memory) {
          var rule = /\s+|\s*,\s*|\n|\r|\r\n|;.*\n|;.*$.*/;
          function splitDir(splitWord,splitWord2,s,k) {
            s = s.slice(k);
            var pos = s.lastIndexOf(splitWord);
            if (pos < s.lastIndexOf(splitWord2)) pos = s.lastIndexOf(splitWord2);
            var dir = (pos < 0)? '': s.slice(0,pos);
            var file = (pos < 0)? s.slice(0): s.slice(pos+splitWord.length);
            return [dir,file];
          }
          function changeDir(splitWord,splitWord2,parentWord,currentWord,s,k,dir) {
            var pos = s.indexOf(splitWord,k);
            if (pos < s.indexOf(splitWord2,k)) pos = s.indexOf(splitWord2,k);
            var t = (pos < 0)? s.slice(k): s.slice(k,pos);
            if (t != currentWord)
            if (t == parentWord) { if (dir.length > 0) dir.pop(); }
            else if (t in dir.slice(-1)[0]) dir.push(dir.slice(-1)[0][t]);
            else pos = -1;
            if (pos >= 0) dir = changeDir(splitWord,splitWord2,parentWord,currentWord,s.slice(k+pos+splitWord.length),0,dir);
            return dir;
          }
          function checkDir(splitWord,splitWord2,parentWord,currentWord,s,k,dir) {
            var pos = s.indexOf(splitWord,k);
            if (pos < s.indexOf(splitWord2,k)) pos = s.indexOf(splitWord2,k);
            var t = (pos < 0)? s.slice(k): s.slice(k,pos);
            if (t != currentWord)
            if (t == parentWord) if (dir.length > 0) dir.pop(); else return false;
            else if (t in dir.slice(-1)[0]) dir.push(dir.slice(-1)[0][t]); else return false;
            if (pos >= 0) if (!checkDir(splitWord,splitWord2,parentWord,currentWord,s.slice(k+pos+splitWord.length),0,dir)) return false;
            return true;
          }
          function inject(m,j,splitWord,splitWord2,parentWord,currentWord,changeWord,includeWord,switchWord,insertWord,rule,p,a,dir,counter) {
            if (typeof a == 'string') a = [a];
            if (Array.isArray(a)) {
              for (var i = 0; i < a.length; i++) {
                var f = a[i].split(rule);
                for (var v in f) {
                  if (typeof f[v] == 'string') {
                    var s = f[v];
                    for (var k = 0; k < s.length; k++) {
                      if (s.lastIndexOf(changeWord,0) == 0) {
                        s = s.slice(changeWord.length);
                        if (checkDir(splitWord,splitWord2,parentWord,currentWord,s,k,dir.slice(0))) dir = changeDir(splitWord,splitWord2,currentWord,parentWord,s,k,dir);
                      } else if (s.lastIndexOf(includeWord,0) == 0) {
                        var path = splitDir(splitWord,splitWord2,s.slice(includeWord.length),k), d = dir.slice(0);
                        if (path[0].length > 0) if (checkDir(splitWord,splitWord2,parentWord,currentWord,path[0],k,d.slice(0))) 
                          d = changeDir(splitWord,splitWord2,parentWord,currentWord,path[0],k,d.slice(0)); 
                        if (path[1] in d.slice(-1)[0]) j = inject(m,j,splitWord,splitWord2,parentWord,currentWord,changeWord,includeWord,switchWord,insertWord,rule,p,d.slice(-1)[0][path[1]],d,counter);
                        else if (s != '') {
                          if (p[0].isInterface(s)) {
                            m[j++] = p[0].getInterfaceCode(s);
                            if (counter.on) counter.counter++; 
                          } else if (s.lastIndexOf(insertWord,0) == 0) {
                            m[j++] = counter.counter;
                            if (counter.on) counter.counter++;
                          } else if (s.lastIndexOf(switchWord,0) == 0) {
                            if (counter.on = !counter.on) counter.counter = 0;
                          } 
                          else {
                          }
                        }
                      } else if (s != '') { 
                        m[j++] = s; 
                        if (counter.on) counter.counter++; 
                      }
                      s = '';
                    }
                  }
                }
              }
            }
            return j;
          }
          var dir = [json.state];
          var splitWord = "\\";
          var splitWord2 = "/";
          var parentWord = "..";
          var currentWord = ".";
          var changeWord = ":";
          var includeWord = "#";
          var switchWord = "#switch_counter";
          var insertWord = "#insert_counter";
          if (json.state.rule) rule = new RegExp(json.state.rule);
          var a = json.state.memory;
          if (typeof a == 'string') a = [a];
          if (Array.isArray(a)) {
            var m = json.state.memory = [];
            var p = this.processor;
            var j = 0;
            inject(m,j,splitWord,splitWord2,parentWord,currentWord,changeWord,includeWord,switchWord,insertWord,rule,p,a,dir,{counter:0,on:false});
          }
        }
        this.manager.inject(json.state);
      }
      if (json.viewport) this.viewport.inject(json.viewport);
      if (json.core) {
        if (json.core.processor) {
          for (var i = 0; i < json.core.processor.length; i++) {
            this.processor[i].construct();
            this.processor[i].bindImplementation();
            this.processor[i].bindStep();
          }
        }
        this.construct();
        this.bindStep();
        if (json.core.resume) if (json.core.resume == true) { this.step(this.quant,this.callback); }
      }
    }
  }
  this.project = function(json) {
    var r = {};
    if (!json) json = {state:{volume:{}},core:{processor:[]},viewport:{}};
    if (json.state) {
      r.state = this.manager.project(json.state);
      if (json.state.ports) r.state.ports = this.port;
    }
    if (json.core) {
      r.core = {};
      if (json.core.quant) r.core.quant = this.quant;
      if (json.core.processor) {
	r.core.processor = [];
	for (var i = 0; i < this.processor.length; i++) r.core.processor.push(this.processor[i].project(json.core.processor[i]));
      }
      if (json.core.constructors) r.core.constructors = this.constructors;
    }
    if (json.viewport) r.viewport = this.viewport.project(json.viewport);
    return r;
  }
  this.toJSON = function() { return this.project(); }
  this.getProcessor = function(value) {
    return this.processor[value];
  }
  this.addProcessor = function(processor, registers, pointer, construct) {
    var projection = processor.project({state:{volume:{},registers:[]},core:{interface:{},implementation:[],constructors:{},bindProcedures:{}}});
    projection.machine = this;
    projection.state.pointer = pointer;
    processor = new VirtualMachine.Processor(projection);
    if ((construct === undefined) || construct) processor.construct();
    processor.bindImplementation();
    processor.bindStep();
    for(var i = 0; i < processor.registers.length; i++)
      processor.registers[i] = registers[i];
    this.processor.push(processor);
    return processor;
  }
  this.getManager = function() {
    return this.manager;
  }
  this.stop = function() { 
    for(var i = 0; i < this.processor.length; i++)
      this.processor[i].stop(); 
  }
  this.construct = function() { 
    for(var i = 0; i < this.processor.length; i++)
      this.processor[i].construct(this.construct); 
  }
  this.inject(json);
}
VirtualMachine.fromJSON = function(json) { return new VirtualMachine(json); }


VirtualMachine.MemoryManager = function(json) {
  // array hack
  if (!Array.isArray) { Array.isArray = function(arg) { return Object.prototype.toString.call(arg) === '[object Array]'; }; }

  this.memory = [];
  this.VOLUME = this.memory.length;

  this.inject = function(json) {
    if (json) {
      if (json.volume) {
        if (json.volume < this.VOLUME) {
          if (NonTypedArrayMemory || (typeof ArrayBuffer === 'undefined')) {
            this.memory.splice(json.volume,this.VOLUME-json.volume);
          }
          else {
            var m = this.memory;        
            this.memory = new Uint32Array(json.volume);
            for (var i = 0; i < json.volume; i++) this.memory[i] = m[i];
          }
        }
        if (json.volume > this.VOLUME) {
          if (NonTypedArrayMemory || (typeof ArrayBuffer === 'undefined')) {
            for (var i = this.VOLUME; i < json.volume; i++) this.memory.push(0);
          }
          else {
            var m = this.memory;        
            this.memory = new Uint32Array(json.volume);
            for (var i = 0; i < this.VOLUME; i++) this.memory[i] = m[i];
            for (var i = this.VOLUME; i < json.volume; i++) this.memory[i] = 0;
          }
        }
        this.VOLUME = json.volume;
      }
      var from = json.from? json.from: 0;
      var to = json.to? json.to: this.VOLUME;
      if (json.memory !== undefined) {
        var m = [];
        if (typeof json.memory == 'string')
          m = this.decode(json.memory);
        else if (Array.isArray(json.memory))
          m = json.memory;
        if (m.length < to-from) {
          alert('length < to-from:'+m.length+' < '+to-from);
          to = m.length+from;
        }
        for (var i = from; i < to; i++) {
          var v = m[i-from];
          if (typeof v == 'string')
          if (isNaN(v)) {alert(v+' ?'); break; }
          else this.memory[i] = parseInt(v);
          else this.memory[i] = v;
        }
      }
      else if (json.volume) {
        for (var i = from; i < to; i++) this.memory[i] = 0;
      }
    }
  }
  this.project = function(json) {
    var r = {};
    if (!json) json = {volume:{},memory:""};
    if (json.volume) r.volume = this.VOLUME;
    if (json.memory != undefined) {
      var from = json.from? json.from: 0;
      var to = json.to? json.to: this.VOLUME;
      var m = [];
      for (var i = from; i < to; i++)
        m[i-from] = this.memory[i];
      if (typeof json.memory == 'string') 
         r.memory = this.encode(m);
      else {
         r.memory = m;
      }      
    }
    return r;
  }
  this.toJSON = function() { return this.project(); }
  this.encode = function(memory)       {return /*Huffman.encode*/(memory);}
  this.decode = function(memory)       {return /*Huffman.decode*/(memory);}

  this.inject(json);
}

VirtualMachine.MemoryManager.fromJSON = function(json) { return new VirtualMachine.MemoryManager(json); }

VirtualMachine.Processor = function(json) {
  // array hack
  if (!Array.isArray) { Array.isArray = function(arg) { return Object.prototype.toString.call(arg) === '[object Array]'; }; }

  if (typeof ArrayBuffer !== 'undefined') {
    var buffer = new ArrayBuffer(64*8);
    this.registers = new Float64Array(buffer);
  }
//  else
  this.registers = [];
  this.operations = [];
  this.constructors = {};
  this.interface = {};
  this.post = {};
  this.process = {};

  var ip = 0;
  var countdown = 0;
  this.bindProcedures = function(sources) {
    var r = [];
  
    var machine = this.machine;
    var memory = machine.manager.memory;
    var VOLUME = machine.manager.VOLUME;
    var VR_VOLUME = this.VOLUME;
    var registers = this.registers;
    var _interface = this.interface;
    var operations = this.operations;
    var constructor = this.constructors;
    var viewport = machine.viewport;
    var processor = this;

    for (var i = 0; i < sources.length; i++) 
      eval('r[i] = '+sources[i]);
    return r;
  }
  this.bindImplementation = function(constructor) {
    if (this.post.implementation) {
      if (constructor) {
        for (var identifier in this.constructors) {
          try {
            this.operations[this.getInterfaceCode(identifier)] = this.bindProcedures([this.post.implementation[this.getInterfaceCode(identifier)]])[0];
            this.post.implementation[this.getInterfaceCode(identifier)] = "";
          }
          catch(e) {
            alert(e+'\nstack:'+e.stack+'\nconstructor: '+identifier+'\n'+this.post.implementation[this.getInterfaceCode(identifier)]);
          }
        }
      }
      else {
        for (var identifier in this.interface)
          if (this.constructors[identifier] != true) {
            try {
              this.operations[this.getInterfaceCode(identifier)] = this.bindProcedures([this.post.implementation[this.getInterfaceCode(identifier)]])[0];
              this.post.implementation[this.getInterfaceCode(identifier)] = "";
            }
            catch(e) {
              alert(e+'\nstack:'+e.stack+'\ninstruction: '+identifier+'\n'+this.post.implementation[this.getInterfaceCode(identifier)]);
            }
          }
      }
      for (var identifier in this.interface)
        if (this.post.implementation[this.getInterfaceCode(identifier)] != "") return;
      delete this.post.implementation;
    }
  }
  this.bindStep = function() {
    this.step = this.bindProcedures(["\
      function(q,l,c) {\
        var t = l;\
        this.process = setInterval((function() {\
          countdown = (q>t)?t:q; t-=countdown; /*var pi, ai, p;*/\
          /*try {*/\
          while(countdown-- > 0) {\
            var o = memory[registers[ip]];\
	    /*var e = viewport.driver.projection_matrix[viewport.driver.projection_matrix.length-1].elements[14];*/\
	    /*if ((e!=0) && (Math.abs(e+0.2000200020002)>0.00000000001)) brk();*/\
	    /*if ((memory[361898]!=p) && (memory[361899] == 1) && (p == 345672)) dbrk();*/\
	    /*if (memory[10724]===3391106610) dbrk();*/\
	    /*if ((processor.machine.manager.maxAvailable() < 1000) && (registers[ip] > 9)) dbrk();*/\
	    /*p = memory[361898];*/\
            /*if ((o > 0) && (o != 37) && (o != 41) && false) console.log(o+' ');*/\
            /*if (window.ndx !== undefined) if (memory[window.ndx] !== window.n) brk();*/\
            /*ai = pi; pi = registers[ip];*/\
            operations[o].call(processor);\
          }\
          /*}*/\
          /*catch(e) {*/\
            /*alert(e+'\\\nstack:'+e.stack+'\\\noperation: '+o+'\\\n'+processor.operations[o]);*/\
          /*}*/\
          if (t==0) { processor.store(); c(); t = l;}\
        }),0);\
      }"])[0];
  }
  this.setVirtualMachine = function(machine) {
    this.machine = machine;
  }
  this.getVirtualMachine = function() {
    return this.machine;
  }
  this.newRegisters = function(startRegister, pointer, m, r) {
    var registers = r || [];
    m = m || this.machine.manager.memory;
    for(var i = 0; i < this.registers.length; i++)
      if ((pointer > 0) || (registers[i] === undefined)) registers[i] = m[i + pointer];
    registers[ip] = startRegister;
    return registers;
  }
  this.stop = function() { 
    clearInterval(this.process);
    delete this.process;
  }
  this.inject = function(json) {
    if (json) {
      if (json.machine) this.machine = json.machine;
      this.store = function() {};
      if (json.state) {
        var pointer = json.state.pointer;
        this.store = (pointer === undefined)?this.store:(function() {
          for(var i = 0; i < this.registers.length; i++)
            this.machine.manager.memory[pointer + i] = this.registers[i];
        });
        if (json.state.volume) {
          if (json.state.volume < this.VOLUME) this.registers.splice(json.state.volume,this.VOLUME-json.state.volume);
          this.VOLUME = json.state.volume;
        }
        var from = json.state.from? json.state.from: 0;
        var to = json.state.to? json.state.to: this.VOLUME;
        if (json.state.registers !== undefined) {
          var r = [];
          if (Array.isArray(json.state.registers)) 
            r = json.state.registers;
          for (var i = from; i < to; i++) {
            var v = r[i-from];
            this.registers[i] = (typeof v == 'string')? parseInt(v): v;
          }
        }
        else if (json.state.volume) {
          for (var i = from; i < to; i++) this.registers[i] = 0;
        }
      }
      if (json.core) {
        if (json.core.interface) {
          var _interface = {};
          for (var i in json.core.interface) {
            var c = json.core.interface[i];
            _interface[i] = (typeof c == 'string')?parseInt(c):c;
          }
          this.interface = _interface;
        }
        if (json.core.bindProcedures) eval("this.bindProcedures = " + json.core.bindProcedures);
        if (json.core.constructors) this.constructors = json.core.constructors;
        if (json.core.implementation) {
          this.post.implementation = [];
          for(var i in json.core.implementation) {
            if (json.core.implementation[i] != undefined)
              this.post.implementation[(typeof i == 'string')? parseInt(i.trim()): i] = "function(){" + unescape(json.core.implementation[i].toString()) + "};";
          }          
          if (json.core.constructors) {
            this.bindImplementation(true); 
          }
          else {
            this.bindImplementation(); 
          }
        }
//        this.bindStep();
      }
    }
  }
  this.project = function(json) {
    var r = {};
    if (!json) json = {state:{volume:{},registers:[]},core:{interface:{},implementation:[],constructors:{}}};
    if (json.state) {
      r.state = {};
      if (json.state.volume) r.state.volume = this.VOLUME;
      if (json.state.registers) {
        r.state.registers = [];
        var from = json.state.from? json.state.from: 0;
        var to = json.state.to? json.state.to: this.VOLUME;
        for (var i = from; i < to; i++) r.state.registers[i-from] = this.registers[i];
      }
    }
    if (json.core) {
      r.core = {};
      if (json.core.implementation) {
        var implementation = {};
        var n = Math.ceil(Math.log(this.operations.length+0.1)/Math.log(10));
        if (Array.isArray(json.core.implementation)) {
          implementation = [];
          for (var i in this.operations) 
            implementation[i] = VirtualMachine.Processor.getOperationBody(this.operations[i].toString());
        }
        else {
          for (var i in this.interface) {
            var c = this.getInterfaceCode(i);
            implementation[this.codeToStr(c,n)] = VirtualMachine.Processor.getOperationBody(this.operations[c].toString());
          }
        }
        r.core.implementation = implementation;
      }
      if (json.core.interface) {
        r.core.interface = {};
        for (var i in this.interface)
          r.core.interface[i] = this.codeToStr(this.getInterfaceCode(i),n);
      }
      if (json.core.constructors) r.core.constructors = this.constructors;
      if (json.core.bindProcedures) r.core.bindProcedures = this.bindProcedures.toString();
    }
    return r;
  }
  this.toJSON = function() { return this.project(); }
  this.codeToStr = function(c,n) {
    if (n == undefined) n = 11;
    var s = c.toString();
    var l = n - s.length;
    while (l-- > 0) s="0"+s;
    return "0"+s; 
  }
  this.getOperation = function(identifier) {
    return this.operations[this.getInterfaceCode(identifier)];
  }
  this.updateOperation = function(identifier, implementation, constructor) {
    var code = this.getInterfaceCode(identifier);

    var operation = this.bindProcedures(["function(){" + implementation + "};"])[0]; 
    if (code)
      this.operations[code] = operation;
    else {
      code = this.operations.length;
      this.operations.push(operation);
      this.interface[identifier] = code;
    }
    if (constructor) {
      this.constructors[identifier] = true;
      this.operations[code].call(this);
    }
    else delete this.constructors[identifier];
//    this.construct();//??
    
  }
  this.swapOperations = function(nameOne, nameTwo) {
    var codeOne = this.interface[nameOne];
    var codeTwo = this.interface[nameTwo];
    this.interface[nameTwo] = codeOne;
    this.interface[nameOne] = codeTwo;
    var tmp = this.operations[codeOne];
    this.operations[codeOne] = this.operations[codeTwo];
    this.operations[codeTwo] = tmp;
  }
  this.removeOperation = function(identifier) {
    var code = this.getInterfaceCode(identifier);
    delete this.interface[identifier];
    delete this.constructors[identifier];
    delete this.operations[code];
  }
  this.getInterfaceCode = function(identifier) {
    return this.interface[identifier];
  }
  this.isInterface = function(identifier) {
    return this.getInterfaceCode(identifier) != undefined;
  }
  this.getInterface = function() {
    var _interface = [];
    for(var identifier in this.interface)
      _interface.push(identifier);
    return _interface;
  }
  this.isConstructor = function(name) {
    return this.constructors[name] != undefined;
  }
  this.construct = function(constructors) {
    constructors = constructors || this.constructors;
    for(var identifier in constructors) {
      var c = this.getInterfaceCode(identifier);
      if (this.operations[c]) this.operations[c].call(this);
    }
  }
  this.dispose = function() {
    for (var i in this.operations) {
      delete this.operations[i];
      this.operations[i] = undefined;
    }
    delete this.operations;
  }
  this.inject(json);
}
VirtualMachine.Processor.fromJSON = function(json) { return new VirtualMachine.Processor(json); }
VirtualMachine.Processor.getOperationBody = function(operation) {
  var string = operation.toString();
  var preparedString = string.substring(string.indexOf('\{') + 1);
  preparedString = preparedString.substr(0, preparedString.length - 1);
  preparedString = preparedString.replace(/(\n\n+)/g, '\n');
  return preparedString;
}

VirtualMachine.Viewport = function(json) {
  this.inject = function(json) {
  }
  this.project = function(json) {
    var r = {};

    return r;    
  }
  this.toJSON = function() { return this.project(); }
  this.inject(json);
}
VirtualMachine.Viewport.fromJSON = function(json) { return new VirtualMachine.Viewport(json); }

//TODO Remove this
function Visualizer(json) {
  this.canvas = json.container;
  this.context = this.canvas.getContext(json.type);
  this.colormap = {};
  this.valuemap = [];
  this.MAP_SIZE = 1000;

  this.values = json.values.slice();
  this.colors = json.colors.slice();

  this.addGradient = function(startColor, finalColor, startPoint, finalPoint) {
    var l = 0;
    var u = this.values.length;
    var s = (u-l) >> 1;
    while (this.values[s] != startPoint && s > l) {
      if (this.values[s] > startPoint) u = s;
      else l = s;
      s = l + ((u-l) >> 1);
    }
    l = s;
    u = this.values.length;
    var f = u - ((u-l) >> 1);
    while (this.values[f] != finalPoint && u > f) {
      if (this.values[f] < finalPoint) l = f;
      else u = f;
      f = u - ((u-l) >> 1);
    }
    var preStartColor;
    if (this.values[s]+1 < startPoint) {
      preStartColor = Visualizer.recountColor(startPoint-1,this.colors[s],this.colors[s+1],this.values[s],this.values[s+1]);
    }
    else if (this.values[s] == startPoint && s > 0) {
      preStartColor = Visualizer.recountColor(startPoint-1,this.colors[s-1],this.colors[s],this.values[s-1],this.values[s]);
    }

    if (this.values[f] > finalPoint+1) {
      var value = finalPoint+1;
//     if (f >= this.values.length) alert("!" + f);
      var color = Visualizer.recountColor(value,this.colors[f-1],this.colors[f],this.values[f-1],this.values[f]);
      this.values.splice(f,0,value);
      this.colors.splice(f,0,color);
    }
    else if (this.values[f] == finalPoint && f+1 < this.values.length) {
      var value = finalPoint+1;
      var color = Visualizer.recountColor(value,this.colors[f],this.colors[f+1],this.values[f],this.values[f+1]);
      this.values.splice(f,1);
      this.colors.splice(f,1);
      if (value < this.values[f]) {
        this.values.splice(f,0,value);
        this.colors.splice(f,0,color);
      }
    }
    else if (this.values[f] == finalPoint) this.colors[this.colors.length - 1] = finalColor;
    if (f+1 < this.values.length || this.values[f] > finalPoint) if (finalPoint > startPoint) {
      this.values.splice(f,0,finalPoint);
      this.colors.splice(f,0,finalColor);
    }

    if (this.values[s]+1 < startPoint) {
//     if (s >= this.values.length) alert("!" + s);
      var value = startPoint-1;
      // var color = Visualizer.recountColor(value,this.colors[s],this.colors[s+1],this.values[s],this.values[s+1]);
      var color = preStartColor;
      s++;
      this.values.splice(s,0,value);
      this.colors.splice(s,0,color);
      s++;
      f++;
    }
    else if (this.values[s] == startPoint && s > 0) {
      var value = startPoint-1;
      // var color = Visualizer.recountColor(value,this.colors[s-1],this.colors[s],this.values[s-1],this.values[s]);
      var color = preStartColor;
      this.values.splice(s,1);
      this.colors.splice(s,1);
      f--;
      if (value > this.values[s-1]) {
        this.values.splice(s,0,value);
        this.colors.splice(s,0,color);
        s++;
        f++;
      }
    }
    else if (this.values[s] == startPoint) this.colors[0] = startColor;
    else if (this.values[s] < startPoint) s++;
    if (s > 0) {
      this.values.splice(s,0,startPoint);
      this.colors.splice(s,0,startColor);
      f++;
    }
    s++;
    if (f > s) this.values.splice(s,f-s);
    if (f > s) this.colors.splice(s,f-s);

    this.colormap = {};
    this.valuemap = [];

//    alert(this.values);
//    alert(this.colors);


  }
  this.getColor = function(value) {

//    if (value == undefined) { alert("!!!");
//      value = value;
//    }
//    if (isNaN(value)) { alert("!!!!");
//      value = value;
//    }
 
    if (!this.colormap[value]) {
      var l = 0;
      var u = this.values.length-1;
      var s = u - ((u-l) >> 1);
      while (this.values[s] != value && u > s) {
        if (this.values[s] < value) l = s;
        else u = s;
        s = u - ((u-l) >> 1);
      }
      if (this.valuemap.length == this.MAP_SIZE) {
        brk();
        delete this.colormap[this.valuemap[0]];
        this.valuemap.shift();
      }
//      if (l == s) alert("!!");
      this.colormap[value] = Visualizer.recountColor(value,this.colors[l],this.colors[s],this.values[l],this.values[s]);
      brk();
      this.valuemap.push(value);
//      alert(this.valuemap);
//      alert(JSON.stringify(this.colormap,null,1));
    }
    return this.colormap[value];
  }
}

Visualizer.recountColor = function(number, startColor, finishColor, startPoint, finishPoint) {
  var color2 = startColor.substring(1);
  var color1 = finishColor.substring(1);
//      if (number < finishPoint) alert(1);
  var percent = (number - startPoint)/(finishPoint - startPoint);
  var apercent = 1-percent;
  var r = Math.floor(parseInt(color1.substring(0,2), 16) * percent + parseInt(color2.substring(0,2), 16) * apercent);
  var g = Math.floor(parseInt(color1.substring(2,4), 16) * percent + parseInt(color2.substring(2,4), 16) * apercent);
  var b = Math.floor(parseInt(color1.substring(4,6), 16) * percent + parseInt(color2.substring(4,6), 16) * apercent);
  return "#" + Visualizer.hex(r) + Visualizer.hex(g) + Visualizer.hex(b);
//  return "#" + Visualizer.hex(Math.ceil(parseInt(color1.substring(0,6), 16) * percent + parseInt(color2.substring(0,6), 16) * (1-percent)),6);
}

Visualizer.hex = function(x) {
    x = x.toString(16);
    return (x.length < 2)? "0"+x: x;
};

function ArrayVisualizer(json) {
  Visualizer.call(this, json);
  this.size = json.size;
  this.canvas.width = json.size;
  this.update = function(array) {
    var c = this.context;
    var s = this.size;
    var r = array.length/s;
    var h = this.canvas.height;
    for(var i = 0; i < s; i++) {
      c.fillStyle = this.getColor(array[(i*r)>>>0]);
      c.fillRect(i, 0, 1, h);
    }
  }
}

function HistoryVisualizer(json) {
  Visualizer.call(this, json);
  var NUMBER_OF_STATES = 1000;
//  if (this.canvas.height < this.NUMBER_OF_STATES) this.canvas.height += 1;
//  this.canvas.height = this.NUMBER_OF_STATES;
  this.size = json.size;
  this.canvas.width = json.size;
  this.update = function(memory) {
    var c = this.context;
    var image = c.getImageData(0, 0, this.canvas.width, this.canvas.height);
    if (this.canvas.height < NUMBER_OF_STATES) this.canvas.height += 1;
    c.putImageData(image, 0, 1);
//    this.context.translate(0,-1);
    var s = this.size;
    var r = memory.length/s;
    for(var i = 0; i < s; i++) {
      c.fillStyle = this.getColor(memory[(i*r)>>>0]);
      c.fillRect(i, 0, 1, 1);
    }
  }
}

function brk() {
    var i;
    i = i;
    return;
}

function dbrk() {
    var i;
    i = i;
    return;
}

function log(a) { console.log(a); 
}
function mlog(a) { //dlog(a); 
}
function rlog(a) { //dlog(a); 
}
function dlog(a) { 
//	console.log(a); 
	if (++dounter > 5353) {
		console.clear();
		dounter = 0;
	}
}
var dounter = 0;